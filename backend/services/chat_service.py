from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
from google.cloud.firestore_v1.base_query import FieldFilter
from config.firebase_config import get_db
from models.rental import ChatCreate, MessageCreate, ChatResponse, MessageResponse, ChatListResponse, ChatMessagesResponse


class ChatService:
    def __init__(self):
        self.db = None
        self.chats_collection = "chats"
        self.messages_collection = "messages"
        self.properties_collection = "properties"
        self.users_collection = "users"

    def _get_db(self):
        if self.db is None:
            self.db = get_db()
        return self.db

    def create_or_get_chat(self, student_id: str, property_id: str, initial_message: str) -> Dict[str, Any]:
        """Criar novo chat ou retornar chat existente entre estudante e proprietário da propriedade"""
        print(f"[ChatService] Criando/buscando chat para estudante {student_id} e propriedade {property_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Buscar informações da propriedade para obter o advertiser_id
        property_doc = db.collection(self.properties_collection).document(property_id).get()
        if not property_doc.exists:
            raise Exception("Propriedade não encontrada")

        property_data = property_doc.to_dict()
        advertiser_id = property_data.get("owner_id")

        if not advertiser_id:
            raise Exception("Anunciante da propriedade não encontrado")

        # Verificar se já existe um chat entre este estudante e anunciante para esta propriedade
        existing_chat_query = db.collection(self.chats_collection)\
            .where(filter=FieldFilter("student_id", "==", student_id))\
            .where(filter=FieldFilter("advertiser_id", "==", advertiser_id))\
            .where(filter=FieldFilter("property_id", "==", property_id))\
            .stream()

        existing_chat = None
        for doc in existing_chat_query:
            existing_chat = doc.to_dict()
            break

        if existing_chat:
            # Chat já existe, adicionar mensagem inicial se fornecida
            if initial_message and initial_message.strip():
                self._add_message(existing_chat["id"], student_id, initial_message, "student")

            print(f"[OK] [ChatService] Chat existente encontrado: {existing_chat['id']}")
            return existing_chat

        # Criar novo chat
        chat_id = str(uuid.uuid4())
        now = datetime.utcnow()

        chat_data = {
            "id": chat_id,
            "property_id": property_id,
            "student_id": student_id,
            "advertiser_id": advertiser_id,
            "status": "active",
            "created_at": now,
            "updated_at": now
        }

        # Salvar chat no Firestore
        db.collection(self.chats_collection).document(chat_id).set(chat_data)

        # Adicionar mensagem inicial
        if initial_message and initial_message.strip():
            self._add_message(chat_id, student_id, initial_message, "student")

        print(f"[OK] [ChatService] Novo chat criado: {chat_id}")
        return chat_data

    def _add_message(self, chat_id: str, sender_id: str, content: str, sender_type: str) -> Dict[str, Any]:
        """Adicionar mensagem ao chat"""
        db = self._get_db()

        message_id = str(uuid.uuid4())
        now = datetime.utcnow()

        message_data = {
            "id": message_id,
            "chat_id": chat_id,
            "sender_id": sender_id,
            "sender_type": sender_type,
            "content": content,
            "created_at": now,
            "is_read": False
        }

        # Salvar mensagem
        db.collection(self.messages_collection).document(message_id).set(message_data)

        # Atualizar timestamp do chat
        db.collection(self.chats_collection).document(chat_id).update({
            "updated_at": now
        })

        return message_data

    def send_message(self, chat_id: str, sender_id: str, content: str) -> Dict[str, Any]:
        """Enviar mensagem em um chat existente"""
        print(f"[ChatService] Enviando mensagem no chat {chat_id} de {sender_id}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Verificar se o chat existe
        chat_doc = db.collection(self.chats_collection).document(chat_id).get()
        if not chat_doc.exists:
            raise Exception("Chat não encontrado")

        chat_data = chat_doc.to_dict()

        # Verificar se o usuário tem permissão para enviar mensagem neste chat
        if sender_id not in [chat_data["student_id"], chat_data["advertiser_id"]]:
            raise Exception("Você não tem permissão para enviar mensagens neste chat")

        # Determinar tipo do remetente
        sender_type = "student" if sender_id == chat_data["student_id"] else "advertiser"

        # Adicionar mensagem
        message_data = self._add_message(chat_id, sender_id, content, sender_type)

        print(f"[OK] [ChatService] Mensagem enviada: {message_data['id']}")
        return message_data

    def get_user_chats(self, user_id: str, user_type: str) -> List[Dict[str, Any]]:
        """Buscar chats do usuário com otimizações de performance"""
        print(f"[ChatService] Buscando chats do usuário: {user_id}, tipo: {user_type}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Definir campo baseado no tipo de usuário
        field = "student_id" if user_type == "student" else "advertiser_id"

        # Ordenação em Python — combinar equality + order_by em campos distintos exige índice composto
        chats_query = db.collection(self.chats_collection)\
            .where(filter=FieldFilter(field, "==", user_id))\
            .stream()

        chats = []
        property_ids = set()
        user_ids = set()

        # Coletar dados básicos e IDs para batch queries
        for doc in chats_query:
            chat_data = doc.to_dict()
            chats.append(chat_data)
            property_ids.add(chat_data["property_id"])
            user_ids.add(chat_data["student_id"])
            user_ids.add(chat_data["advertiser_id"])

        # Ordenar por updated_at desc em Python
        chats.sort(key=lambda c: c.get("updated_at") or datetime.min, reverse=True)

        # Batch fetch para propriedades, usuários e mensagens
        properties_cache = self._batch_fetch_properties(list(property_ids))
        users_cache = self._batch_fetch_users(list(user_ids))
        messages_by_chat = self._batch_fetch_messages_by_chats([c["id"] for c in chats])

        # Enriquecer chats com dados em cache
        enriched_chats = []
        for chat_data in chats:
            enriched_chat = self._enrich_chat_data_cached(
                chat_data, user_id, properties_cache, users_cache,
                messages_by_chat.get(chat_data["id"], [])
            )
            enriched_chats.append(enriched_chat)

        print(f"[OK] [ChatService] Encontrados {len(enriched_chats)} chats")
        return enriched_chats

    def get_chat_messages(self, chat_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Buscar mensagens de um chat - método legado, usar get_chat_messages_paginated"""
        return self.get_chat_messages_paginated(chat_id, user_id, page=1, limit=100)

    def get_chat_messages_paginated(self, chat_id: str, user_id: str, page: int = 1, limit: int = 20) -> List[Dict[str, Any]]:
        """Buscar mensagens de um chat com paginação super otimizada"""
        print(f"[ChatService] Buscando mensagens do chat: {chat_id}, página: {page}, limite: {limit}")

        db = self._get_db()
        if not db:
            raise Exception("Banco de dados não disponível")

        # Cache da verificação de permissão para evitar consulta repetida
        if not hasattr(self, '_chat_permissions_cache'):
            self._chat_permissions_cache = {}

        cache_key = f"{chat_id}_{user_id}"
        if cache_key not in self._chat_permissions_cache:
            # Verificar se o usuário tem acesso ao chat
            chat_doc = db.collection(self.chats_collection).document(chat_id).get()
            if not chat_doc.exists:
                raise Exception("Chat não encontrado")

            chat_data = chat_doc.to_dict()
            if user_id not in [chat_data["student_id"], chat_data["advertiser_id"]]:
                raise Exception("Você não tem permissão para ver este chat")

            # Cache por 5 minutos
            self._chat_permissions_cache[cache_key] = {
                'valid': True,
                'timestamp': datetime.utcnow(),
                'student_id': chat_data["student_id"],
                'advertiser_id': chat_data["advertiser_id"]
            }

        # Buscar mensagens — equality + order_by em campos distintos exige índice composto, ordena em Python
        messages_query = db.collection(self.messages_collection)\
            .where(filter=FieldFilter("chat_id", "==", chat_id))\
            .stream()

        all_messages = []
        for doc in messages_query:
            message_data = doc.to_dict()
            message_data["_doc_id"] = doc.id
            all_messages.append(message_data)

        # Ordenar por created_at desc e paginar em Python
        all_messages.sort(key=lambda m: m.get("created_at") or datetime.min, reverse=True)
        offset = (page - 1) * limit
        paginated = all_messages[offset:offset + limit]

        messages = []
        message_ids_to_mark_read = []
        sender_ids = set()

        for message_data in paginated:
            doc_id = message_data.pop("_doc_id", None)
            messages.append(message_data)
            sender_ids.add(message_data["sender_id"])

            # Coletar IDs para marcar como lidas
            if doc_id and not message_data.get("is_read", True) and message_data.get("sender_id") != user_id:
                message_ids_to_mark_read.append(doc_id)

        # Buscar nomes dos remetentes em batch
        sender_names_cache = self._batch_fetch_sender_names(list(sender_ids))

        # Segunda passada: enriquecer mensagens
        enriched_messages = []
        for message_data in messages:
            sender_name = sender_names_cache.get(message_data["sender_id"])
            if sender_name:
                message_data["sender_name"] = sender_name
            enriched_messages.append(message_data)

        # Reverter lista para ordem cronológica (mais antigas primeiro)
        enriched_messages.reverse()

        # Marcar mensagens como lidas em background (não bloquear resposta)
        if message_ids_to_mark_read:
            # Executar em background para não atrasar resposta
            import threading
            threading.Thread(
                target=self._mark_specific_messages_as_read,
                args=(message_ids_to_mark_read,),
                daemon=True
            ).start()

        print(f"[OK] [ChatService] Encontradas {len(enriched_messages)} mensagens")
        return enriched_messages

    def _batch_fetch_sender_names(self, sender_ids: List[str]) -> Dict[str, str]:
        """Buscar nomes dos remetentes em batch para cache"""
        db = self._get_db()
        names_cache = {}

        # Cache local de nomes por 5 minutos
        if not hasattr(self, '_sender_names_cache'):
            self._sender_names_cache = {}

        for sender_id in sender_ids:
            if sender_id in self._sender_names_cache:
                cache_entry = self._sender_names_cache[sender_id]
                # Cache válido por 5 minutos
                if (datetime.utcnow() - cache_entry['timestamp']).seconds < 300:
                    names_cache[sender_id] = cache_entry['name']
                    continue

            try:
                doc = db.collection(self.users_collection).document(sender_id).get()
                if doc.exists:
                    sender_data = doc.to_dict()
                    name = sender_data.get("name") or sender_data.get("company_name") or "Usuário"
                    names_cache[sender_id] = name

                    # Atualizar cache local
                    self._sender_names_cache[sender_id] = {
                        'name': name,
                        'timestamp': datetime.utcnow()
                    }
            except Exception:
                names_cache[sender_id] = "Usuário"

        return names_cache

    def _enrich_chat_data(self, chat_data: Dict[str, Any], current_user_id: str) -> Dict[str, Any]:
        """Enriquecer dados do chat com informações adicionais"""
        db = self._get_db()

        # Buscar informações da propriedade
        property_doc = db.collection(self.properties_collection).document(chat_data["property_id"]).get()
        if property_doc.exists:
            property_data = property_doc.to_dict()
            chat_data["property_title"] = property_data.get("title")
            chat_data["property_images"] = property_data.get("images", [])
            chat_data["property_price"] = property_data.get("price")

        # Buscar informações dos participantes
        student_doc = db.collection(self.users_collection).document(chat_data["student_id"]).get()
        if student_doc.exists:
            student_data = student_doc.to_dict()
            chat_data["student_name"] = student_data.get("name")

        advertiser_doc = db.collection(self.users_collection).document(chat_data["advertiser_id"]).get()
        if advertiser_doc.exists:
            advertiser_data = advertiser_doc.to_dict()
            chat_data["advertiser_name"] = advertiser_data.get("name") or advertiser_data.get("company_name")

        # Stream único de mensagens — order_by + != exigem índices compostos, calcula em Python
        messages_query = db.collection(self.messages_collection)\
            .where(filter=FieldFilter("chat_id", "==", chat_data["id"]))\
            .stream()

        all_messages = [doc.to_dict() for doc in messages_query]

        # Última mensagem por created_at desc
        last_message = None
        if all_messages:
            last_message = max(
                all_messages,
                key=lambda m: m.get("created_at") or datetime.min
            )

        # Contar não lidas de outros remetentes
        unread_count = sum(
            1 for m in all_messages
            if not m.get("is_read", True) and m.get("sender_id") != current_user_id
        )

        if last_message:
            chat_data["last_message"] = last_message.get("content")
            chat_data["last_message_at"] = last_message.get("created_at")

        chat_data["unread_count"] = unread_count

        return chat_data

    def _enrich_message_data(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enriquecer dados da mensagem com informações do remetente"""
        db = self._get_db()

        # Buscar informações do remetente
        sender_doc = db.collection(self.users_collection).document(message_data["sender_id"]).get()
        if sender_doc.exists:
            sender_data = sender_doc.to_dict()
            message_data["sender_name"] = sender_data.get("name") or sender_data.get("company_name")

        return message_data

    def _mark_messages_as_read(self, chat_id: str, user_id: str):
        """Marcar mensagens como lidas"""
        db = self._get_db()

        # Buscar mensagens não lidas do chat que não foram enviadas pelo usuário atual
        messages_query = db.collection(self.messages_collection)\
            .where(filter=FieldFilter("chat_id", "==", chat_id))\
            .where(filter=FieldFilter("is_read", "==", False))\
            .stream()

        batch = db.batch()
        for doc in messages_query:
            message_data = doc.to_dict()
            if message_data.get("sender_id") != user_id:
                batch.update(doc.reference, {"is_read": True})

        batch.commit()

    def _mark_specific_messages_as_read(self, message_ids: List[str]):
        """Marcar mensagens específicas como lidas em batch"""
        if not message_ids:
            return

        db = self._get_db()
        batch = db.batch()

        for message_id in message_ids:
            message_ref = db.collection(self.messages_collection).document(message_id)
            batch.update(message_ref, {"is_read": True})

        batch.commit()

    def _batch_fetch_properties(self, property_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Buscar propriedades em 1 round-trip via get_all"""
        db = self._get_db()
        cache: Dict[str, Dict[str, Any]] = {}
        unique_ids = list({pid for pid in property_ids if pid})
        if not unique_ids:
            return cache

        refs = [db.collection(self.properties_collection).document(pid) for pid in unique_ids]
        for snap in db.get_all(refs):
            if snap.exists:
                cache[snap.id] = snap.to_dict()
        return cache

    def _batch_fetch_users(self, user_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Buscar usuários em 1 round-trip via get_all"""
        db = self._get_db()
        cache: Dict[str, Dict[str, Any]] = {}
        unique_ids = list({uid for uid in user_ids if uid})
        if not unique_ids:
            return cache

        refs = [db.collection(self.users_collection).document(uid) for uid in unique_ids]
        for snap in db.get_all(refs):
            if snap.exists:
                cache[snap.id] = snap.to_dict()
        return cache

    def _batch_fetch_messages_by_chats(self, chat_ids: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """Buscar mensagens de múltiplos chats em batch usando `in` (até 30 por query)"""
        db = self._get_db()
        messages_by_chat: Dict[str, List[Dict[str, Any]]] = {cid: [] for cid in chat_ids}

        for i in range(0, len(chat_ids), 30):
            batch_ids = chat_ids[i:i + 30]
            docs = db.collection(self.messages_collection)\
                .where(filter=FieldFilter("chat_id", "in", batch_ids))\
                .stream()
            for doc in docs:
                m = doc.to_dict()
                cid = m.get("chat_id")
                if cid in messages_by_chat:
                    messages_by_chat[cid].append(m)

        return messages_by_chat

    def _enrich_chat_data_cached(self, chat_data: Dict[str, Any], current_user_id: str,
                                properties_cache: Dict[str, Dict[str, Any]],
                                users_cache: Dict[str, Dict[str, Any]],
                                chat_messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Enriquecer chat com dados pré-carregados — sem queries adicionais ao Firestore"""

        property_data = properties_cache.get(chat_data["property_id"])
        if property_data:
            chat_data["property_title"] = property_data.get("title")
            chat_data["property_images"] = property_data.get("images", [])
            chat_data["property_price"] = property_data.get("price")

        student_data = users_cache.get(chat_data["student_id"])
        if student_data:
            chat_data["student_name"] = student_data.get("name")

        advertiser_data = users_cache.get(chat_data["advertiser_id"])
        if advertiser_data:
            chat_data["advertiser_name"] = advertiser_data.get("name") or advertiser_data.get("company_name")

        last_message = None
        if chat_messages:
            last_message = max(
                chat_messages,
                key=lambda m: m.get("created_at") or datetime.min
            )

        unread_count = sum(
            1 for m in chat_messages
            if not m.get("is_read", True) and m.get("sender_id") != current_user_id
        )

        if last_message:
            chat_data["last_message"] = last_message.get("content")
            chat_data["last_message_at"] = last_message.get("created_at")

        chat_data["unread_count"] = unread_count

        return chat_data


# Instância global do serviço
chat_service = ChatService()