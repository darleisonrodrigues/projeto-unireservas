"""
Serviço para operações com propriedades no Firestore
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from google.cloud import firestore
from config.firebase_config import get_db
from models.property import Property, PropertyCreate, PropertyUpdate, FilterState


class PropertyService:
    def __init__(self):
        self.db = None
        self.collection = "properties"
    
    def _get_db(self):
        if self.db is None:
            self.db = get_db()
        return self.db

    def create_property(self, property_data: PropertyCreate, owner_id: str) -> Property:
        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")
            
        property_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        property_dict = property_data.model_dump()
        property_dict.update({
            "id": property_id,
            "owner_id": owner_id,
            "created_at": now,
            "updated_at": now,
            "is_favorited": False,
            "rating": 0.0
        })
        
        # Salvar no Firestore
        db.collection(self.collection).document(property_id).set(property_dict)
        
        return Property(**property_dict)

    def get_property(self, property_id: str) -> Optional[Property]:
        """Buscar propriedade por ID"""
        doc = self.db.collection(self.collection).document(property_id).get()
        
        if doc.exists:
            data = doc.to_dict()
            return Property(**data)
        
        return None

    def get_properties(
        self, 
        page: int = 1, 
        per_page: int = 10,
        filters: Optional[FilterState] = None,
        owner_id: Optional[str] = None
    ) -> Dict[str, Any]:
        query = self.db.collection(self.collection)
        
        # Aplicar filtros
        if owner_id:
            query = query.where("owner_id", "==", owner_id)
            
        if filters:
            if filters.property_type and filters.property_type != "todos":
                query = query.where("type", "==", filters.property_type)
            
            if filters.max_price:
                query = query.where("price", "<=", filters.max_price)
            
            if filters.location:
                # Busca por localização (pode ser melhorada com índices)
                query = query.where("location", ">=", filters.location)
                query = query.where("location", "<=", filters.location + "\uf8ff")
        
        # Ordenação
        if filters and filters.sort_by:
            if filters.sort_by == "menor-preco":
                query = query.order_by("price", direction=firestore.Query.ASCENDING)
            elif filters.sort_by == "maior-preco":
                query = query.order_by("price", direction=firestore.Query.DESCENDING)
            elif filters.sort_by == "mais-recente":
                query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
            elif filters.sort_by == "melhor-avaliado":
                query = query.order_by("rating", direction=firestore.Query.DESCENDING)
        else:
            query = query.order_by("created_at", direction=firestore.Query.DESCENDING)
        
        # Total de documentos (antes da paginação)
        total_docs = len(list(query.stream()))
        
        # Paginação
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        # Executar query
        docs = query.stream()
        properties = []
        
        for doc in docs:
            data = doc.to_dict()
            properties.append(Property(**data))
        
        total_pages = (total_docs + per_page - 1) // per_page
        
        return {
            "properties": properties,
            "total": total_docs,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }

    def update_property(self, property_id: str, property_data: PropertyUpdate, owner_id: str) -> Optional[Property]:
        doc_ref = self.db.collection(self.collection).document(property_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        current_data = doc.to_dict()
        
        # Verificar se o usuário é o dono
        if current_data.get("owner_id") != owner_id:
            raise PermissionError("Usuário não tem permissão para editar esta propriedade")
        
        # Atualizar apenas campos fornecidos
        update_data = property_data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        doc_ref.update(update_data)
        
        # Buscar dados atualizados
        updated_doc = doc_ref.get()
        return Property(**updated_doc.to_dict())

    def delete_property(self, property_id: str, owner_id: str) -> bool:
        doc_ref = self.db.collection(self.collection).document(property_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return False
        
        current_data = doc.to_dict()
        
        # Verificar se o usuário é o dono
        if current_data.get("owner_id") != owner_id:
            raise PermissionError("Usuário não tem permissão para deletar esta propriedade")
        
        doc_ref.delete()
        return True

    def search_properties(self, search_term: str, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        # Esta é uma implementação básica
        # Para uma busca mais avançada, considere usar Algolia ou Elasticsearch
        query = self.db.collection(self.collection)
        
        # Busca por título (pode ser expandida)
        if search_term:
            query = query.where("title", ">=", search_term)
            query = query.where("title", "<=", search_term + "\uf8ff")
        
        # Paginação
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)
        
        docs = query.stream()
        properties = []
        
        for doc in docs:
            data = doc.to_dict()
            properties.append(Property(**data))
        
        return {
            "properties": properties,
            "total": len(properties),
            "page": page,
            "per_page": per_page
        }

    def toggle_favorite(self, property_id: str, user_id: str) -> bool:
        # Esta implementação pode ser movida para um serviço de favoritos separado
        favorites_ref = self.db.collection("user_favorites").document(user_id)
        favorites_doc = favorites_ref.get()
        
        if favorites_doc.exists:
            favorites_data = favorites_doc.to_dict()
            current_favorites = favorites_data.get("property_ids", [])
        else:
            current_favorites = []
        
        if property_id in current_favorites:
            current_favorites.remove(property_id)
            is_favorited = False
        else:
            current_favorites.append(property_id)
            is_favorited = True
        
        favorites_ref.set({
            "property_ids": current_favorites,
            "updated_at": datetime.utcnow()
        })
        
        return is_favorited