
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from config.firebase_config import get_db
from models.rental import RentalInterest, RentalRequest


class RentalService:
    def __init__(self):
        self.db = None
        self.interests_collection = "rental_interests"
        self.requests_collection = "rental_requests"

    def _get_db(self):
        if self.db is None:
            self.db = get_db()
        return self.db
    
        #Demonstrar interesse em uma propriedade
    def express_interest(self, property_id: str, student_id: str, message: str = None) -> Dict[str, Any]:
        print(f"[RentalService] Estudante {student_id} demonstrando interesse na propriedade {property_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Verificar se o estudante já demonstrou interesse nesta propriedade
        existing_interest = db.collection(self.interests_collection)\
            .where(filter=FieldFilter("property_id", "==", property_id))\
            .where(filter=FieldFilter("student_id", "==", student_id))\
            .where(filter=FieldFilter("status", "==", "pending"))\
            .stream()

        if any(existing_interest):
            raise Exception("Você já demonstrou interesse nesta propriedade")

        # Buscar informaçoes da propriedade para obter o advertiser_id
        property_doc = db.collection("properties").document(property_id).get()
        if not property_doc.exists:
            raise Exception("Propriedade não encontrada")

        property_data = property_doc.to_dict()
        advertiser_id = property_data.get("owner_id")

        if not advertiser_id:
            raise Exception("Anunciante da propriedade não encontrado")

        # Criar registro de interesse
        interest_id = str(uuid.uuid4())
        now = datetime.utcnow()

        interest_data = {
            "id": interest_id,
            "property_id": property_id,
            "student_id": student_id,
            "advertiser_id": advertiser_id,
            "message": message,
            "status": "pending",
            "created_at": now,
            "updated_at": now
        }

        # Salvar no Firestore
        db.collection(self.interests_collection).document(interest_id).set(interest_data)

        print(f"[OK] [RentalService] Interesse registrado: {interest_id}")
        return interest_data
    
        #Buscar interesses do estudante
    def _batch_fetch_docs(self, collection: str, doc_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Buscar múltiplos documentos por ID em 1 round-trip via get_all"""
        db = self._get_db()
        cache: Dict[str, Dict[str, Any]] = {}
        unique_ids = list({did for did in doc_ids if did})
        if not unique_ids:
            return cache

        refs = [db.collection(collection).document(did) for did in unique_ids]
        for snap in db.get_all(refs):
            if snap.exists:
                cache[snap.id] = snap.to_dict()
        return cache

    def get_student_interests(self, student_id: str) -> List[Dict[str, Any]]:
        print(f"[RentalService] Buscando interesses do estudante: {student_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        docs = db.collection(self.interests_collection)\
            .where(filter=FieldFilter("student_id", "==", student_id))\
            .stream()

        interests = [doc.to_dict() for doc in docs]

        # Batch fetch das propriedades referenciadas
        property_ids = [i["property_id"] for i in interests if i.get("property_id")]
        properties_cache = self._batch_fetch_docs("properties", property_ids)

        for interest_data in interests:
            prop = properties_cache.get(interest_data.get("property_id"))
            if prop:
                interest_data["property"] = prop

        interests.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)

        print(f"[OK] [RentalService] Encontrados {len(interests)} interesses")
        return interests

        #Buscar interesses recebidos pelo anunciante
    def get_advertiser_interests(self, advertiser_id: str) -> List[Dict[str, Any]]:
        print(f"[RentalService] Buscando interesses do anunciante: {advertiser_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        docs = db.collection(self.interests_collection)\
            .where(filter=FieldFilter("advertiser_id", "==", advertiser_id))\
            .stream()

        interests = [doc.to_dict() for doc in docs]

        # Batch fetch das propriedades e estudantes referenciados
        property_ids = [i["property_id"] for i in interests if i.get("property_id")]
        student_ids = [i["student_id"] for i in interests if i.get("student_id")]
        properties_cache = self._batch_fetch_docs("properties", property_ids)
        students_cache = self._batch_fetch_docs("users", student_ids)

        for interest_data in interests:
            prop = properties_cache.get(interest_data.get("property_id"))
            if prop:
                interest_data["property"] = prop
            student = students_cache.get(interest_data.get("student_id"))
            if student:
                interest_data["student"] = student

        interests.sort(key=lambda x: x.get("created_at", datetime.min), reverse=True)

        print(f"[OK] [RentalService] Encontrados {len(interests)} interesses")
        return interests

        #Atualizar status de um interesse (apenas pelo anunciante)
    def update_interest_status(self, interest_id: str, status: str, advertiser_id: str) -> Dict[str, Any]:
        print(f"[RentalService] Atualizando interesse {interest_id} para status: {status}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.interests_collection).document(interest_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise Exception("Interesse não encontrado")

        interest_data = doc.to_dict()

        # Verificar se o anunciante é o dono
        if interest_data.get("advertiser_id") != advertiser_id:
            raise Exception("Você não tem permissão para alterar este interesse")

        # Atualizar status
        doc_ref.update({
            "status": status,
            "updated_at": datetime.utcnow()
        })

        updated_doc = doc_ref.get()
        result = updated_doc.to_dict()

        print(f"[OK] [RentalService] Status do interesse atualizado")
        return result


# Instância global do serviço
rental_service = RentalService()