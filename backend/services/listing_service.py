"""
Serviço para operações com listings no Firestore
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from google.cloud import firestore
from config.firebase_config import get_db
from models.listing import Listing, ListingCreate, ListingUpdate


class ListingService:
    def __init__(self):
        self.db = get_db()
        self.collection = "listings"
    #Criar um novo listing
    def create_listing(self, listing_data: ListingCreate, user_id: str) -> Listing:
        listing_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        listing_dict = listing_data.model_dump()
        listing_dict.update({
            "id": listing_id,
            "user_id": user_id,
            "created_at": now,
            "updated_at": now,
            "photos": [],  # Será preenchido após upload
            "is_active": True,
            "views": 0,
            "rating": 0.0
        })
        
        # Salvar no Firestore
        self.db.collection(self.collection).document(listing_id).set(listing_dict)
        
        return Listing(**listing_dict)

    def get_listing(self, listing_id: str) -> Optional[Listing]:
        """Buscar listing por ID"""
        doc = self.db.collection(self.collection).document(listing_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            # Incrementar visualizações
            self.increment_views(listing_id)
            return Listing(**data)
        
        return None

    def get_listings(
        self, 
        page: int = 1, 
        per_page: int = 10,
        user_id: Optional[str] = None,
        property_type: Optional[str] = None,
        university: Optional[str] = None,
        is_active: bool = True
    ) -> Dict[str, Any]:
      #Buscar listings com filtros e paginação
        query = self.db.collection(self.collection)
        
        # Aplicar filtros
        if user_id:
            query = query.where("user_id", "==", user_id)
        
        if property_type and property_type != "todos":
            query = query.where("type", "==", property_type)
        
        if university:
            query = query.where("university", "==", university)
        
        if is_active is not None:
            query = query.where("is_active", "==", is_active)
        
        # Ordenação por data de criação (mais recentes primeiro)
        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        
        # Total de documentos (antes da paginação)
        total_docs = len(list(query.stream()))
        
        # Paginação
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        # Executar query
        docs = query.stream()
        listings = []
        
        for doc in docs:
            data = doc.to_dict()
            listings.append(Listing(**data))
        
        total_pages = (total_docs + per_page - 1) // per_page
        
        return {
            "listings": listings,
            "total": total_docs,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }
        #Atualizar listing
    def update_listing(self, listing_id: str, listing_data: ListingUpdate, user_id: str) -> Optional[Listing]:
        doc_ref = self.db.collection(self.collection).document(listing_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Verificar se o usuário é o dono
        if current_data.get("user_id") != user_id:
            raise PermissionError("Usuário não tem permissão para editar este listing")
        
        # Atualizar apenas campos fornecidos
        update_data = listing_data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        doc_ref.update(update_data)
        
        # Buscar dados atualizados
        updated_doc = doc_ref.get()
        return Listing(**updated_doc.to_dict())
       #Deletar listing (soft delete)"""
    def delete_listing(self, listing_id: str, user_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(listing_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        # Verificar se o usuário é o dono
        if current_data.get("user_id") != user_id:
            raise PermissionError("Usuário não tem permissão para deletar este listing")
        
        # Soft delete
        doc_ref.update({
            "is_active": False,
            "updated_at": datetime.utcnow()
        })
        
        return True
    #Incrementar número de visualizações
    def increment_views(self, listing_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(listing_id)
        doc = doc_ref.get()
        
        if doc.exists:
            current_views = doc.to_dict().get("views", 0)
            doc_ref.update({
                "views": current_views + 1,
                "updated_at": datetime.utcnow()
            })
            return True
        
        return False

    def search_listings(self, search_term: str, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        #Buscar listings por termo
        query = self.db.collection(self.collection)
        
        # Filtrar apenas listings ativos
        query = query.where("is_active", "==", True)
        
        if search_term:
            query = query.where("title", ">=", search_term)
            query = query.where("title", "<=", search_term + "\uf8ff")
        
        # Ordenação por relevância (views e rating)
        query = query.order_by("views", direction=firestore.Query.DESCENDING)
        
        # Paginação
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        docs = query.stream()
        listings = []
        
        for doc in docs:
            data = doc.to_dict()
            listings.append(Listing(**data))
        
        return {
            "listings": listings,
            "total": len(listings),
            "page": page,
            "per_page": per_page
        }

    def update_photos(self, listing_id: str, photo_urls: List[str], user_id: str) -> bool:
        """Atualizar URLs das fotos do listing"""
        doc_ref = self.db.collection(self.collection).document(listing_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        # Verificar se o usuário é o dono
        if current_data.get("user_id") != user_id:
            raise PermissionError("Usuário não tem permissão para editar este listing")
        
        doc_ref.update({
            "photos": photo_urls,
            "updated_at": datetime.utcnow()
        })
        
        return True

    def get_listings_by_university(self, university: str, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        """Buscar listings por universidade"""
        query = self.db.collection(self.collection)
        query = query.where("university", "==", university)
        query = query.where("is_active", "==", True)
        query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        
        # Total de documentos
        total_docs = len(list(query.stream()))
        
        # Paginação
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        docs = query.stream()
        listings = []
        
        for doc in docs:
            data = doc.to_dict()
            listings.append(Listing(**data))
        
        total_pages = (total_docs + per_page - 1) // per_page
        
        return {
            "listings": listings,
            "total": total_docs,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }