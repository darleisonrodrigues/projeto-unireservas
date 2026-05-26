from typing import Optional, Dict, Any, List
from datetime import datetime, date
import uuid
from config.firebase_config import get_db
from models.rental import ReservationCreate, ReservationUpdate, ReservationResponse
from utils.reservation_utils import ReservationStatus, parse_iso_date


class ReservationService:
    def __init__(self):
        self.db = None
        self.collection = "reservations"
        self.properties_collection = "properties"
        self.users_collection = "users"

    def _get_db(self):
        if self.db is None:
            self.db = get_db()
        return self.db

    def _batch_fetch(self, collection: str, ids: List[str]) -> Dict[str, Dict]:
        """Busca múltiplos documentos em uma única requisição ao Firestore.

        Substitui N chamadas .get() individuais por um único db.get_all(),
        reduzindo round-trips de rede de O(n) para O(1).
        """
        if not ids:
            return {}
        db = self._get_db()
        refs = [db.collection(collection).document(doc_id) for doc_id in ids]
        docs = db.get_all(refs)
        return {doc.id: (doc.to_dict() if doc.exists else {}) for doc in docs}

    def _assemble_response(
        self,
        reservation: Dict[str, Any],
        property_data: Dict,
        student_data: Dict,
        advertiser_data: Dict,
    ) -> ReservationResponse:
        """Monta ReservationResponse a partir de dicts já carregados — sem I/O."""
        return ReservationResponse(
            id=reservation["id"],
            property_id=reservation["property_id"],
            student_id=reservation["student_id"],
            advertiser_id=reservation["advertiser_id"],
            start_date=parse_iso_date(reservation["start_date"]),
            end_date=parse_iso_date(reservation["end_date"]),
            guests=reservation["guests"],
            message=reservation.get("message"),
            total_price=reservation["total_price"],
            status=reservation["status"],
            created_at=reservation["created_at"],
            updated_at=reservation["updated_at"],
            property_title=property_data.get("title"),
            property_type=property_data.get("type"),
            property_location=property_data.get("location"),
            property_images=property_data.get("images", []),
            student_name=student_data.get("name"),
            student_email=student_data.get("email"),
            advertiser_name=advertiser_data.get("name") or advertiser_data.get("company_name"),
            advertiser_email=advertiser_data.get("email"),
        )

    # Criar nova reserva
    def create_reservation(self, reservation_data: ReservationCreate, student_id: str) -> Dict[str, Any]:
        print(f"[ReservationService] Criando reserva para student: {student_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        property_doc = db.collection(self.properties_collection).document(reservation_data.property_id).get()
        if not property_doc.exists:
            raise Exception("Propriedade não encontrada")

        property_data = property_doc.to_dict()
        advertiser_id = property_data.get("owner_id")

        if student_id == advertiser_id:
            raise Exception("Você não pode fazer reserva em sua própria propriedade")

        existing_reservations = self._get_property_reservations(
            reservation_data.property_id,
            reservation_data.start_date,
            reservation_data.end_date,
        )

        if existing_reservations:
            raise Exception("Propriedade não disponível para as datas selecionadas")

        reservation_id = str(uuid.uuid4())
        now = datetime.utcnow()

        reservation_dict = {
            "id": reservation_id,
            "property_id": reservation_data.property_id,
            "student_id": student_id,
            "advertiser_id": advertiser_id,
            "start_date": reservation_data.start_date.isoformat(),
            "end_date": reservation_data.end_date.isoformat(),
            "guests": reservation_data.guests,
            "message": reservation_data.message,
            "total_price": reservation_data.total_price,
            "status": ReservationStatus.PENDING,
            "created_at": now,
            "updated_at": now,
        }

        db.collection(self.collection).document(reservation_id).set(reservation_dict)
        print(f"[ReservationService] Reserva criada: {reservation_id}")
        return reservation_dict

    # Verificar reservas existentes para uma propriedade em um período
    def _get_property_reservations(self, property_id: str, start_date: date, end_date: date) -> List[Dict]:
        db = self._get_db()

        query = (
            db.collection(self.collection)
            .where("property_id", "==", property_id)
            .where("status", "in", ReservationStatus.active_statuses())
        )

        reservations = []
        for doc in query.stream():
            reservation = doc.to_dict()
            reservation_start = parse_iso_date(reservation["start_date"])
            reservation_end = parse_iso_date(reservation["end_date"])

            if start_date <= reservation_end and end_date >= reservation_start:
                reservations.append(reservation)

        return reservations

    # Buscar reserva por ID
    def get_reservation_by_id(self, reservation_id: str, user_id: str) -> Optional[ReservationResponse]:
        print(f"[ReservationService] Buscando reserva: {reservation_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc = db.collection(self.collection).document(reservation_id).get()
        if not doc.exists:
            return None

        reservation = doc.to_dict()

        if user_id not in [reservation["student_id"], reservation["advertiser_id"]]:
            raise Exception("Você não tem permissão para ver esta reserva")

        return self._build_reservation_response(reservation)

    # Buscar reservas do usuário — otimizado com batch fetch
    def get_user_reservations(self, user_id: str, user_type: str = "student") -> List[ReservationResponse]:
        print(f"[ReservationService] Buscando reservas do usuário: {user_id}, tipo: {user_type}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        field = "student_id" if user_type == "student" else "advertiser_id"

        # Query 1 — buscar todas as reservas do usuário
        raw_reservations = [
            doc.to_dict()
            for doc in db.collection(self.collection).where(field, "==", user_id).stream()
        ]

        if not raw_reservations:
            print(f"[ReservationService] Nenhuma reserva encontrada")
            return []

        # Coletar IDs únicos para eliminar fetches redundantes
        property_ids = list({r["property_id"] for r in raw_reservations})
        user_ids = list(
            {r["student_id"] for r in raw_reservations}
            | {r["advertiser_id"] for r in raw_reservations}
        )

        # Query 2 + Query 3 — batch fetch (O(1) independente de N reservas)
        properties_map = self._batch_fetch(self.properties_collection, property_ids)
        users_map = self._batch_fetch(self.users_collection, user_ids)

        # Montagem em memória — zero I/O adicional
        reservations = [
            self._assemble_response(
                r,
                properties_map.get(r["property_id"], {}),
                users_map.get(r["student_id"], {}),
                users_map.get(r["advertiser_id"], {}),
            )
            for r in raw_reservations
        ]

        reservations.sort(key=lambda x: x.created_at, reverse=True)
        print(f"[ReservationService] Encontradas {len(reservations)} reservas")
        return reservations

    # Atualizar reserva
    def update_reservation(
        self, reservation_id: str, update_data: ReservationUpdate, user_id: str
    ) -> Optional[ReservationResponse]:
        print(f"[ReservationService] Atualizando reserva: {reservation_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.collection).document(reservation_id)
        doc = doc_ref.get()

        if not doc.exists:
            return None

        current_data = doc.to_dict()

        if user_id == current_data["student_id"]:
            allowed_fields = ["start_date", "end_date", "guests", "message"]
            update_dict = {
                k: v
                for k, v in update_data.model_dump(exclude_unset=True).items()
                if k in allowed_fields
            }
        elif user_id == current_data["advertiser_id"]:
            allowed_fields = ["status"]
            update_dict = {
                k: v
                for k, v in update_data.model_dump(exclude_unset=True).items()
                if k in allowed_fields
            }
        else:
            raise Exception("Você não tem permissão para editar esta reserva")

        if not update_dict:
            raise Exception("Nenhum campo válido para atualização")

        if "start_date" in update_dict or "end_date" in update_dict:
            new_start = parse_iso_date(update_dict.get("start_date", current_data["start_date"]))
            new_end = parse_iso_date(update_dict.get("end_date", current_data["end_date"]))

            if "start_date" in update_dict:
                update_dict["start_date"] = new_start.isoformat()
            if "end_date" in update_dict:
                update_dict["end_date"] = new_end.isoformat()

            existing_reservations = self._get_property_reservations(
                current_data["property_id"], new_start, new_end
            )
            for res in existing_reservations:
                if res["id"] != reservation_id:
                    raise Exception("Conflito de datas com outra reserva")

        update_dict["updated_at"] = datetime.utcnow()
        doc_ref.update(update_dict)

        updated_doc = doc_ref.get()
        return self._build_reservation_response(updated_doc.to_dict())

    # Cancelar reserva
    def cancel_reservation(self, reservation_id: str, user_id: str) -> bool:
        print(f"[ReservationService] Cancelando reserva: {reservation_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.collection).document(reservation_id)
        doc = doc_ref.get()

        if not doc.exists:
            return False

        current_data = doc.to_dict()

        if user_id not in [current_data["student_id"], current_data["advertiser_id"]]:
            raise Exception("Você não tem permissão para cancelar esta reserva")

        if current_data["status"] in ReservationStatus.terminal_statuses():
            raise Exception("Reserva já foi cancelada ou rejeitada")

        doc_ref.update({
            "status": ReservationStatus.CANCELLED,
            "updated_at": datetime.utcnow(),
        })

        print(f"[ReservationService] Reserva cancelada: {reservation_id}")
        return True

    # Lookup individual (get_by_id e update) — usa batch para os 2 users em 1 call
    def _build_reservation_response(self, reservation: Dict[str, Any]) -> ReservationResponse:
        properties_map = self._batch_fetch(
            self.properties_collection, [reservation["property_id"]]
        )
        users_map = self._batch_fetch(
            self.users_collection,
            list({reservation["student_id"], reservation["advertiser_id"]}),
        )
        return self._assemble_response(
            reservation,
            properties_map.get(reservation["property_id"], {}),
            users_map.get(reservation["student_id"], {}),
            users_map.get(reservation["advertiser_id"], {}),
        )


# Instância global do serviço
reservation_service = ReservationService()
