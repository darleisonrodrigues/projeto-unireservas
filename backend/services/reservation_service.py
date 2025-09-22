from typing import Optional, Dict, Any, List
from datetime import datetime, date
import uuid
from google.cloud import firestore
from config.firebase_config import get_db
from models.rental import ReservationCreate, ReservationUpdate, ReservationResponse


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
    
      #Criar nova reserva
    def create_reservation(self, reservation_data: ReservationCreate, student_id: str) -> Dict[str, Any]:
        print(f"[ReservationService] Criando reserva para student: {student_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Buscar informações da propriedade
        property_doc = db.collection(self.properties_collection).document(reservation_data.property_id).get()
        if not property_doc.exists:
            raise Exception("Propriedade não encontrada")

        property_data = property_doc.to_dict()
        advertiser_id = property_data.get("owner_id")

        # Verificar se o estudante não é o proprietário
        if student_id == advertiser_id:
            raise Exception("Você não pode fazer reserva em sua própria propriedade")

        # Verificar disponibilidade da propriedade para as datas
        existing_reservations = self._get_property_reservations(reservation_data.property_id,
                                                              reservation_data.start_date,
                                                              reservation_data.end_date)

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
            "status": "pending",
            "created_at": now,
            "updated_at": now,
        }

        # Salvar no Firestore
        db.collection(self.collection).document(reservation_id).set(reservation_dict)

        print(f"[ReservationService] Reserva criada: {reservation_id}")
        return reservation_dict
    
        #Verificar reservas existentes para uma propriedade em um período
    def _get_property_reservations(self, property_id: str, start_date: date, end_date: date) -> List[Dict]:
        db = self._get_db()

        query = db.collection(self.collection).where("property_id", "==", property_id).where("status", "in", ["pending", "confirmed"])

        reservations = []
        for doc in query.stream():
            reservation = doc.to_dict()
            reservation_start = datetime.fromisoformat(reservation["start_date"]).date()
            reservation_end = datetime.fromisoformat(reservation["end_date"]).date()

            # Verificar se há conflito de datas
            if (start_date <= reservation_end and end_date >= reservation_start):
                reservations.append(reservation)

        return reservations
    
        #Buscar reserva por ID (apenas se o usuário for o proprietário ou o estudante)
    def get_reservation_by_id(self, reservation_id: str, user_id: str) -> Optional[ReservationResponse]:

        print(f"[ReservationService] Buscando reserva: {reservation_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc = db.collection(self.collection).document(reservation_id).get()
        if not doc.exists:
            return None

        reservation = doc.to_dict()

        # Verificar se o usuário tem permissão para ver a reserva
        if user_id not in [reservation["student_id"], reservation["advertiser_id"]]:
            raise Exception("Você não tem permissão para ver esta reserva")

        return self._build_reservation_response(reservation)
    
        #Buscar reservas do usuário
    def get_user_reservations(self, user_id: str, user_type: str = "student") -> List[ReservationResponse]:
        print(f"[ReservationService] Buscando reservas do usuário: {user_id}, tipo: {user_type}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Definir campo baseado no tipo de usuário
        field = "student_id" if user_type == "student" else "advertiser_id"

        # Usar query sem ordenação para evitar erro de índice
        query = db.collection(self.collection).where(field, "==", user_id)

        reservations = []
        for doc in query.stream():
            reservation = doc.to_dict()
            reservation_response = self._build_reservation_response(reservation)
            reservations.append(reservation_response)

        # Ordenar por created_at em Python (mais recentes primeiro)
        reservations.sort(key=lambda x: x.created_at, reverse=True)

        print(f"[ReservationService] Encontradas {len(reservations)} reservas")
        return reservations

       #Atualizar reserva
    def update_reservation(self, reservation_id: str, update_data: ReservationUpdate, user_id: str) -> Optional[ReservationResponse]:

        print(f"[ReservationService] Atualizando reserva: {reservation_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.collection).document(reservation_id)
        doc = doc_ref.get()

        if not doc.exists:
            return None

        current_data = doc.to_dict()

        # Verificar permissões
        if user_id == current_data["student_id"]:
            # Estudante só pode alterar dados básicos, não o status
            allowed_fields = ["start_date", "end_date", "guests", "message"]
            update_dict = {k: v for k, v in update_data.model_dump(exclude_unset=True).items() if k in allowed_fields}
        elif user_id == current_data["advertiser_id"]:
            # Anunciante pode alterar status da reserva
            allowed_fields = ["status"]
            update_dict = {k: v for k, v in update_data.model_dump(exclude_unset=True).items() if k in allowed_fields}
        else:
            raise Exception("Você não tem permissão para editar esta reserva")

        if not update_dict:
            raise Exception("Nenhum campo válido para atualização")

        # Verificar conflitos de data se estiver alterando datas
        if "start_date" in update_dict or "end_date" in update_dict:
            new_start = update_dict.get("start_date", datetime.fromisoformat(current_data["start_date"]).date())
            new_end = update_dict.get("end_date", datetime.fromisoformat(current_data["end_date"]).date())

            if isinstance(new_start, str):
                new_start = datetime.fromisoformat(new_start).date()
            if isinstance(new_end, str):
                new_end = datetime.fromisoformat(new_end).date()

            # Converter datas para string para o Firestore
            if "start_date" in update_dict:
                update_dict["start_date"] = new_start.isoformat()
            if "end_date" in update_dict:
                update_dict["end_date"] = new_end.isoformat()

            # Verificar conflitos (excluindo a reserva atual)
            existing_reservations = self._get_property_reservations(current_data["property_id"], new_start, new_end)
            for res in existing_reservations:
                if res["id"] != reservation_id:
                    raise Exception("Conflito de datas com outra reserva")

        update_dict["updated_at"] = datetime.utcnow()
        doc_ref.update(update_dict)

        # Buscar dados atualizados
        updated_doc = doc_ref.get()
        return self._build_reservation_response(updated_doc.to_dict())

        #Cancelar reserva
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

        # Verificar permissões (estudante ou anunciante podem cancelar)
        if user_id not in [current_data["student_id"], current_data["advertiser_id"]]:
            raise Exception("Você não tem permissão para cancelar esta reserva")

        # Verificar se a reserva pode ser cancelada
        if current_data["status"] in ["cancelled", "rejected"]:
            raise Exception("Reserva já foi cancelada ou rejeitada")

        doc_ref.update({
            "status": "cancelled",
            "updated_at": datetime.utcnow()
        })

        print(f"[ReservationService] Reserva cancelada: {reservation_id}")
        return True

        #Construir resposta da reserva com informações adicionais
    def _build_reservation_response(self, reservation: Dict[str, Any]) -> ReservationResponse:
        db = self._get_db()

        # Buscar informações da propriedade
        property_doc = db.collection(self.properties_collection).document(reservation["property_id"]).get()
        property_data = property_doc.to_dict() if property_doc.exists else {}

        # Buscar informações do estudante
        student_doc = db.collection(self.users_collection).document(reservation["student_id"]).get()
        student_data = student_doc.to_dict() if student_doc.exists else {}

        # Buscar informações do anunciante
        advertiser_doc = db.collection(self.users_collection).document(reservation["advertiser_id"]).get()
        advertiser_data = advertiser_doc.to_dict() if advertiser_doc.exists else {}

        return ReservationResponse(
            id=reservation["id"],
            property_id=reservation["property_id"],
            student_id=reservation["student_id"],
            advertiser_id=reservation["advertiser_id"],
            start_date=datetime.fromisoformat(reservation["start_date"]).date(),
            end_date=datetime.fromisoformat(reservation["end_date"]).date(),
            guests=reservation["guests"],
            message=reservation.get("message"),
            total_price=reservation["total_price"],
            status=reservation["status"],
            created_at=reservation["created_at"],
            updated_at=reservation["updated_at"],
            # Informações da propriedade
            property_title=property_data.get("title"),
            property_type=property_data.get("type"),
            property_location=property_data.get("location"),
            property_images=property_data.get("images", []),
            # Informações do estudante
            student_name=student_data.get("name"),
            student_email=student_data.get("email"),
            # Informações do anunciante
            advertiser_name=advertiser_data.get("name") or advertiser_data.get("company_name"),
            advertiser_email=advertiser_data.get("email")
        )


# Instância global do serviço
reservation_service = ReservationService()