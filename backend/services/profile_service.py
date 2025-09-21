
import logging
from typing import Union, Optional
from config.firebase_config import get_db
from models.profile import (StudentProfile,AdvertiserProfile,)

# Configurar logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# uniao para representar qualquer um dos perfis de usuario
UserProfile = Union[StudentProfile, AdvertiserProfile]

class ProfileService:
    def __init__(self):
        self.db = get_db()
        if self.db:
            self.collection = self.db.collection("users")
        else:
            logger.error("Falha ao inicializar o banco de dados Firestore.")
            self.collection = None

    def _get_db(self):
        return self.db
        #Busca um usuário pelo email no Firestore
    def get_user_by_email(self, email: str) -> Optional[UserProfile]:
        if not self.collection:
            return None
        try:
            query = self.collection.where("email", "==", email).limit(1)
            docs = query.stream()
            for doc in docs:
                user_data = doc.to_dict()
                # Decide qual modelo Pydantic usar com base no campo 'user_type'
                if user_data.get("user_type") == "student":
                    return StudentProfile(**user_data)
                elif user_data.get("user_type") == "advertiser":
                    return AdvertiserProfile(**user_data)
            return None
        except Exception as e:
            logger.error(f"Erro ao buscar usuário por email '{email}': {e}")
            return None
        #Busca um usuário pelo Firebase UID
    def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[UserProfile]:
        if not self.collection:
            return None
        try:
            query = self.collection.where("firebase_uid", "==", firebase_uid).limit(1)
            docs = query.stream()
            for doc in docs:
                user_data = doc.to_dict()
                if user_data.get("user_type") == "student":
                    return StudentProfile(**user_data)
                elif user_data.get("user_type") == "advertiser":
                    return AdvertiserProfile(**user_data)
            return None
        except Exception as e:
            logger.error(f"Erro ao buscar usuário por Firebase UID '{firebase_uid}': {e}")
            return None