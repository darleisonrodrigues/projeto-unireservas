"""
Serviço para operações com perfis de usuário no Firestore
"""

from typing import Optional, Dict, Any, Union
from datetime import datetime
import uuid
from passlib.context import CryptContext

from google.cloud import firestore
from config.firebase_config import get_db
from models.profile import (
    User, StudentProfile, AdvertiserProfile, 
    UserCreate, ProfileUpdateRequest, StudentPreferences
)


class ProfileService:
    def __init__(self):
        self.db = get_db()
        self.collection = "users"
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    #Hash da senha
    def hash_password(self, password: str) -> str:

        return self.pwd_context.hash(password)
       #Verificar senha
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_user(self, user_data: UserCreate):  #Criar novo usuário
        user_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        # Hash da senha
        hashed_password = self.hash_password(user_data.password)
        
        # Obter tipo de usuário e nome da empresa com compatibilidade
        user_type = user_data.get_user_type()
        company_name = user_data.get_company_name()
        
        # Dados base do usuário
        user_dict = {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "phone": user_data.phone or "0000000000",
            "user_type": user_type,
            "password": hashed_password,
            "created_at": now,
            "updated_at": now,
            "is_active": True
        }
        
        if user_type == "student":
            # Perfil de estudante
            user_dict.update({
                "university": user_data.university or "",
                "course": user_data.course or "Não informado",
                "semester": user_data.semester or "Não informado", 
                "bio": "",
                "preferences": {
                    "budget": "",
                    "room_type": None,
                    "amenities": [],
                    "location": None,
                    "max_distance": None
                },
                "favorite_properties": []
            })
            
        else:
            # Perfil de anunciante
            user_dict.update({
                "company_name": company_name or "",
                "cnpj": user_data.cnpj or "",
                "description": user_data.description or "",
                "address": user_data.address or "",
                "website": user_data.website,
                "verified": False,
                "rating": 0.0,
                "total_properties": 0,
                "properties": []
            })
        
        # Salvar no Firestore
        self.db.collection(self.collection).document(user_id).set(user_dict)
        
        # Remover senha do retorno e criar objeto simples
        user_dict.pop("password")
        
        # Retornar objeto simples em vez de modelo Pydantic
        class SimpleUser:
            def __init__(self, data):
                for key, value in data.items():
                    setattr(self, key, value)
        
        return SimpleUser(user_dict)
        #Buscar usuário por email (inclui senha para autenticação)
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        query = self.db.collection(self.collection).where("email", "==", email).limit(1)
        docs = list(query.stream())
        
        if docs:
            return docs[0].to_dict()
        
        return None
        #Buscar usuário por ID
    def get_user_by_id(self, user_id: str) -> Optional[Union[StudentProfile, AdvertiserProfile]]:
        doc = self.db.collection(self.collection).document(user_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            # Remover senha do retorno
            data.pop("password", None)
            
            if data["user_type"] == "cliente":
                return StudentProfile(**data)
            else:
                return AdvertiserProfile(**data)
        
        return None
       #Atualizar perfil do usuário
    def update_profile(
        self, 
        user_id: str, 
        update_data: ProfileUpdateRequest
    ) -> Optional[Union[StudentProfile, AdvertiserProfile]]:
        doc_ref = self.db.collection(self.collection).document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Preparar dados para atualização
        update_dict = update_data.model_dump(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()
        
        # Validar campos específicos por tipo de usuário
        user_type = current_data["user_type"]
        
        if user_type == "cliente":
            # Campos permitidos para estudante
            allowed_fields = {
                "name", "email", "phone", "profile_image", 
                "university", "course", "semester", "bio", "preferences"
            }
        else:
            # Campos permitidos para anunciante
            allowed_fields = {
                "name", "email", "phone", "profile_image",
                "company_name", "cnpj", "description", "address", "website"
            }
        
        # Filtrar apenas campos permitidos
        filtered_update = {k: v for k, v in update_dict.items() if k in allowed_fields or k == "updated_at"}
        
        # Atualizar no Firestore
        doc_ref.update(filtered_update)
        
        # Buscar dados atualizados
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data.pop("password", None)
        
        if user_type == "cliente":
            return StudentProfile(**updated_data)
        else:
            return AdvertiserProfile(**updated_data)
        #Adicionar propriedade aos favoritos
    def add_favorite_property(self, user_id: str, property_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        if current_data["user_type"] != "cliente":
            return False
        
        favorites = current_data.get("favorite_properties", [])
        
        if property_id not in favorites:
            favorites.append(property_id)
            doc_ref.update({
                "favorite_properties": favorites,
                "updated_at": datetime.utcnow()
            })
        
        return True
        #Remover propriedade dos favoritos
    def remove_favorite_property(self, user_id: str, property_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        if current_data["user_type"] != "cliente":
            return False
        
        favorites = current_data.get("favorite_properties", [])
        
        if property_id in favorites:
            favorites.remove(property_id)
            doc_ref.update({
                "favorite_properties": favorites,
                "updated_at": datetime.utcnow()
            })
        
        return True
        #Buscar IDs das propriedades favoritas do usuário
    def get_user_favorites(self, user_id: str) -> list:
        doc = self.db.collection(self.collection).document(user_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            if data["user_type"] == "cliente":
                return data.get("favorite_properties", [])
        
        return []
        #Atualizar estatísticas do anunciante
    def update_advertiser_stats(self, user_id: str, total_properties: int, rating: float) -> bool:
        doc_ref = self.db.collection(self.collection).document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        if current_data["user_type"] != "anunciante":
            return False
        
        doc_ref.update({
            "total_properties": total_properties,
            "rating": rating,
            "updated_at": datetime.utcnow()
        })
        
        return True
        #Verificar anunciante
    def verify_advertiser(self, user_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        if current_data["user_type"] != "anunciante":
            return False
        
        doc_ref.update({
            "verified": True,
            "updated_at": datetime.utcnow()
        })
        
        return True
        #Desativar usuário
    def deactivate_user(self, user_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        doc_ref.update({
            "is_active": False,
            "updated_at": datetime.utcnow()
        })
        
        return True