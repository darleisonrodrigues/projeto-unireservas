from fastapi import APIRouter, HTTPException, status, Depends
from typing import Union, List
from models.rental import ChatCreate, MessageCreate, ChatResponse, MessageResponse, ChatListResponse, ChatMessagesResponse
from models.profile import StudentProfile, AdvertiserProfile
from services.chat_service import chat_service
from utils.firebase_auth import get_current_user_firebase


router = APIRouter()


# Criar novo chat ou obter chat existente (quando estudante demonstra interesse)
@router.post("/create", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_or_get_chat(
    chat_data: ChatCreate,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        chat = chat_service.create_or_get_chat(
            student_id=current_user.id,
            property_id=chat_data.property_id,
            initial_message=chat_data.initial_message
        )

        # Enriquecer dados para resposta
        enriched_chat = chat_service._enrich_chat_data(chat, current_user.id)
        return ChatResponse(**enriched_chat)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar chat: {str(e)}"
        )


# Enviar mensagem em um chat
@router.post("/message", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        message = chat_service.send_message(
            chat_id=message_data.chat_id,
            sender_id=current_user.id,
            content=message_data.content
        )

        # Enriquecer dados para resposta
        enriched_message = chat_service._enrich_message_data(message)
        return MessageResponse(**enriched_message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao enviar mensagem: {str(e)}"
        )


# Listar chats do usuário
@router.get("/my", response_model=ChatListResponse)
async def get_my_chats(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        chats = chat_service.get_user_chats(
            user_id=current_user.id,
            user_type=current_user.user_type
        )

        chat_responses = [ChatResponse(**chat) for chat in chats]
        return ChatListResponse(chats=chat_responses, total=len(chat_responses))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar chats: {str(e)}"
        )


# Buscar mensagens de um chat específico com paginação
@router.get("/{chat_id}/messages", response_model=ChatMessagesResponse)
async def get_chat_messages(
    chat_id: str,
    page: int = 1,
    limit: int = 20,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        # Validar parâmetros
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:  # Máximo 100 mensagens por página
            limit = 20

        messages = chat_service.get_chat_messages_paginated(
            chat_id=chat_id,
            user_id=current_user.id,
            page=page,
            limit=limit
        )

        message_responses = [MessageResponse(**message) for message in messages]
        return ChatMessagesResponse(
            chat_id=chat_id,
            messages=message_responses,
            total=len(message_responses)
        )
    except Exception as e:
        if "permissão" in str(e).lower() or "não encontrado" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar mensagens: {str(e)}"
        )


# Buscar detalhes de um chat específico
@router.get("/{chat_id}", response_model=ChatResponse)
async def get_chat_details(
    chat_id: str,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        # Verificar se o usuário tem acesso ao chat
        db = chat_service._get_db()
        chat_doc = db.collection(chat_service.chats_collection).document(chat_id).get()

        if not chat_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat não encontrado"
            )

        chat_data = chat_doc.to_dict()

        if current_user.id not in [chat_data["student_id"], chat_data["advertiser_id"]]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para ver este chat"
            )

        # Enriquecer dados para resposta
        enriched_chat = chat_service._enrich_chat_data(chat_data, current_user.id)
        return ChatResponse(**enriched_chat)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar chat: {str(e)}"
        )