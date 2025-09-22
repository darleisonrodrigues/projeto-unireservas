
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from google.cloud import firestore
from config.firebase_config import get_db
from models.property import Property, PropertyCreate, PropertyUpdate


class PropertyService:
    def __init__(self):
        self.db = None
        self.collection = "properties"

    def _get_db(self):
        if self.db is None:
            self.db = get_db()
        return self.db
    
        #Criar nova propriedade
    def create_property(self, property_data: PropertyCreate, owner_id: str) -> Dict[str, Any]:
        print(f"[PropertyService] Criando propriedade para owner: {owner_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        property_id = str(uuid.uuid4())
        now = datetime.utcnow()

        property_dict = {
            "id": property_id,
            "owner_id": owner_id,
            "title": property_data.title,
            "type": property_data.type,
            "price": property_data.price,
            "location": property_data.location,
            "university": property_data.university,
            "distance": property_data.distance,
            "images": [],  # Inicia com a lista de imagens vazia
            "amenities": property_data.amenities,
            "capacity": property_data.capacity,
            "description": property_data.description,
            "rating": 0.0,
            "is_favorited": False,
            "created_at": now,
            "updated_at": now,
            "is_active": True
        }

        # Salvar no Firestore
        db.collection(self.collection).document(property_id).set(property_dict)

        print(f"[PropertyService] Propriedade criada: {property_id}")
        return property_dict
        #Adiciona URLs de imagens a uma propriedade existente
    def add_images_to_property(self, property_id: str, image_urls: list, user_id: str) -> Dict[str, Any]:
        print(f"[PropertyService] Adicionando imagens à propriedade {property_id}")
        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")
        
        doc_ref = db.collection(self.collection).document(property_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"[PropertyService] Propriedade {property_id} não encontrada ao adicionar imagens")
            return None
        
        property_data = doc.to_dict()
        if property_data.get('owner_id') != user_id:
            raise Exception("Você não tem permissão para editar esta propriedade")

        doc_ref.update({
            'images': firestore.ArrayUnion(image_urls),
            'updated_at': datetime.utcnow()
        })

        updated_doc = doc_ref.get()
        print(f"[OK] [PropertyService] Imagens adicionadas com sucesso à propriedade {property_id}")
        result = updated_doc.to_dict()
        result["id"] = updated_doc.id
        return result
    
        #Buscar propriedade por ID
    def get_property_by_id(self, property_id: str) -> Optional[Dict[str, Any]]:
        print(f"[PropertyService] Buscando propriedade: {property_id}")
        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")
        doc = db.collection(self.collection).document(property_id).get()
        if doc.exists:
            print("[OK] [PropertyService] Propriedade encontrada")
            prop_data = doc.to_dict()
            prop_data["id"] = doc.id  # Adicionar o ID do documento
            return prop_data
        print("[PropertyService] Propriedade não encontrada")
        return None
    
        #Listar propriedades com paginação e filtros
    def get_properties(self, owner_id: str = None, page: int = 1, per_page: int = 10, filters=None, current_user_id: str = None) -> Dict[str, Any]:
        print(f"[PropertyService] Listando propriedades - Owner: {owner_id}, Page: {page}")
        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")
        query = db.collection(self.collection)
        if owner_id:
            query = query.where("owner_id", "==", owner_id)
        if filters:
            if filters.property_type:
                query = query.where("type", "==", filters.property_type)
            if filters.max_price:
                query = query.where("price", "<=", filters.max_price)
            if filters.location:
                query = query.where("location", ">=", filters.location).where("location", "<=", filters.location + "\uf8ff")
        
        try:
            all_docs = list(query.stream())
            total_docs = len(all_docs)
        except Exception:
            total_docs = 0
            all_docs = []

        offset = (page - 1) * per_page
        properties = []
        for doc in all_docs[offset:offset + per_page]:
            prop_data = doc.to_dict()
            prop_data["id"] = doc.id  # Adicionar o ID do documento
            properties.append(prop_data)

        # Se temos um usuário logado, verificar favoritos
        if current_user_id:
            user_favorites = self._get_user_favorites(current_user_id)
            for property_data in properties:
                property_data["is_favorited"] = property_data["id"] in user_favorites

        total_pages = (total_docs + per_page - 1) // per_page if total_docs > 0 else 1

        result = {
            "properties": properties, "total": total_docs, "page": page,
            "per_page": per_page, "total_pages": total_pages
        }
        print(f"[OK] [PropertyService] Encontradas {len(properties)} propriedades")
        return result
    
        #Atualizar propriedade (apenas pelo owner)
    def update_property(self, property_id: str, property_data: PropertyUpdate, owner_id: str) -> Optional[Dict[str, Any]]:
        print(f"[PropertyService] Atualizando propriedade {property_id} pelo owner {owner_id}")
        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")
        doc_ref = db.collection(self.collection).document(property_id)
        doc = doc_ref.get()
        if not doc.exists:
            print("[PropertyService] Propriedade não encontrada")
            return None
        current_data = doc.to_dict()
        if current_data.get("owner_id") != owner_id:
            print("[PropertyService] Usuário não é o proprietário")
            raise Exception("Você não tem permissão para editar esta propriedade")
        update_data = property_data.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        result = updated_doc.to_dict()
        result["id"] = updated_doc.id
        print("[OK] [PropertyService] Propriedade atualizada")
        return result
    
        #Deletar propriedade (apenas pelo owner)
    def delete_property(self, property_id: str, owner_id: str) -> bool:
        print(f"[PropertyService] Deletando propriedade {property_id} pelo owner {owner_id}")

        db = self._get_db()
        if not db:
            print(f"[ERROR] [PropertyService] Banco de dados não disponível")
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.collection).document(property_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"[ERROR] [PropertyService] Propriedade {property_id} não encontrada")
            return False

        current_data = doc.to_dict()
        current_owner = current_data.get("owner_id")

        print(f"[PropertyService] Owner atual da propriedade: {current_owner}")
        print(f"[PropertyService] Owner requisitando deleção: {owner_id}")

        if current_owner != owner_id:
            print(f"[ERROR] [PropertyService] Usuário {owner_id} não é o proprietário da propriedade {property_id}")
            raise Exception("Você não tem permissão para deletar esta propriedade")

        # Deletar o documento
        try:
            doc_ref.delete()
            print(f"[OK] [PropertyService] Propriedade {property_id} deletada com sucesso")
            return True
        except Exception as e:
            print(f"[ERROR] [PropertyService] Erro ao deletar documento: {str(e)}")
            raise Exception(f"Erro ao deletar propriedade: {str(e)}")

       #Buscar propriedades por termo e filtros
    def search_properties(self, search_term: str = None, filters=None, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        print(f"[PropertyService] Buscando propriedades - Termo: {search_term}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        query = db.collection(self.collection)

        # Busca por termo (implementação básica)
        if search_term:
            query = query.where("title", ">=", search_term)
            query = query.where("title", "<=", search_term + "\uf8ff")

        # Aplicar outros filtros
        if filters:
            if filters.property_type:
                query = query.where("type", "==", filters.property_type)
            if filters.max_price:
                query = query.where("price", "<=", filters.max_price)

        # Paginação
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        try:
            docs = query.stream()
            properties = []
            for doc in docs:
                prop_data = doc.to_dict()
                prop_data["id"] = doc.id
                properties.append(prop_data)
        except Exception:
            properties = []

        result = {
            "properties": properties,
            "total": len(properties),
            "page": page,
            "per_page": per_page
        }

        print(f"[OK] [PropertyService] Busca retornou {len(properties)} propriedades")
        return result
    
        #Buscar todas as propriedades de um anunciante
    def get_properties_by_owner(self, owner_id: str, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        print(f"[PropertyService] Buscando propriedades do owner: {owner_id}")

        return self.get_properties(owner_id=owner_id, page=page, per_page=per_page)

    def toggle_favorite(self, property_id: str, user_id: str, is_favorite: bool) -> bool:
        """Adicionar/remover dos favoritos do usuário"""
        print(f"[PropertyService] Toggling favorite {property_id} para user {user_id}: {is_favorite}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Verificar se a propriedade existe
        property_doc = db.collection(self.collection).document(property_id).get()
        if not property_doc.exists:
            print("[PropertyService] Propriedade não encontrada")
            return False

        # Buscar usuário
        user_doc_ref = db.collection("users").document(user_id)
        user_doc = user_doc_ref.get()

        if not user_doc.exists:
            print("[PropertyService] Usuário não encontrado")
            return False

        user_data = user_doc.to_dict()
        favorite_properties = user_data.get("favorite_properties", [])

        # Atualizar lista de favoritos
        if is_favorite:
            if property_id not in favorite_properties:
                favorite_properties.append(property_id)
        else:
            if property_id in favorite_properties:
                favorite_properties.remove(property_id)

        # Salvar no perfil do usuário
        user_doc_ref.update({
            "favorite_properties": favorite_properties,
            "updated_at": datetime.utcnow()
        })

        print(f"[OK] [PropertyService] Favorito atualizado no perfil do usuário")
        return True
    
        #Buscar lista de favoritos do usuario
    def _get_user_favorites(self, user_id: str) -> List[str]:
        try:
            db = self._get_db()
            if not db:
                return []

            # Buscar favoritos do usuário no perfil
            user_doc = db.collection("users").document(user_id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                return user_data.get("favorite_properties", [])
            return []
        except Exception as e:
            print(f"[ERROR] Erro ao buscar favoritos do usuário {user_id}: {e}")
            return []

    # Deletar imagens específicas de uma propriedade
    def delete_images_from_property(self, property_id: str, image_urls: List[str], user_id: str) -> bool:
        """Deleta imagens específicas de uma propriedade"""
        print(f"[PropertyService] Deletando {len(image_urls)} imagens da propriedade {property_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.collection).document(property_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"[PropertyService] Propriedade {property_id} não encontrada")
            return False

        property_data = doc.to_dict()
        if property_data.get('owner_id') != user_id:
            raise Exception("Você não tem permissão para editar esta propriedade")

        # Remover as URLs específicas da lista de imagens
        current_images = property_data.get('images', [])
        updated_images = [img for img in current_images if img not in image_urls]

        doc_ref.update({
            'images': updated_images,
            'updated_at': datetime.utcnow()
        })

        print(f"[OK] [PropertyService] {len(image_urls)} imagens deletadas da propriedade {property_id}")
        return True

    # Reordenar imagens de uma propriedade
    def reorder_property_images(self, property_id: str, image_urls: List[str], user_id: str) -> bool:
        """Reordena as imagens de uma propriedade"""
        print(f"[PropertyService] Reordenando imagens da propriedade {property_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        doc_ref = db.collection(self.collection).document(property_id)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"[PropertyService] Propriedade {property_id} não encontrada")
            return False

        property_data = doc.to_dict()
        if property_data.get('owner_id') != user_id:
            raise Exception("Você não tem permissão para editar esta propriedade")

        # Verificar se todas as URLs fornecidas existem na propriedade
        current_images = property_data.get('images', [])
        if set(image_urls) != set(current_images):
            raise Exception("As URLs fornecidas não correspondem às imagens atuais da propriedade")

        doc_ref.update({
            'images': image_urls,
            'updated_at': datetime.utcnow()
        })

        print(f"[OK] [PropertyService] Imagens reordenadas na propriedade {property_id}")
        return True


# Instancia global do serviço
property_service = PropertyService()