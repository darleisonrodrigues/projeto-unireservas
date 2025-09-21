# Conteúdo FINAL e CORRIGIDO para: projeto-unireservas/backend/routers/profiles.py

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Union
from datetime import datetime, timezone
from services.profile_service import ProfileService, UserProfile
from models.profile import (ApiResponse,ProfileUpdateRequest,StudentProfile,AdvertiserProfile)
from utils.firebase_auth import get_current_user_firebase

router = APIRouter()
profile_service = ProfileService()

@router.get("/me", response_model=ApiResponse)
async def get_my_profile(current_user: UserProfile = Depends(get_current_user_firebase)):
    """Retorna o perfil do usuário atualmente logado."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )
    
    user_data = current_user.model_dump()
    if 'user_type' in user_data:
        user_data['userType'] = user_data.pop('user_type')

    return ApiResponse(success=True, data=user_data)


@router.put("/me", response_model=ApiResponse)
async def update_my_profile(
    update_data: ProfileUpdateRequest,
    current_user: UserProfile = Depends(get_current_user_firebase)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    # Converte os dados recebidos para um dicionário, excluindo valores nulos
    update_dict = update_data.model_dump(exclude_unset=True, by_alias=True)
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum dado fornecido para atualização."
        )

    # Se o email está sendo alterado, precisa atualizar no Firebase Auth também
    if "email" in update_dict and update_dict["email"] != current_user.email:
        try:
            from firebase_admin import auth as fb_auth
            fb_auth.update_user(current_user.firebase_uid, email=update_dict["email"])
            print(f"[PROFILE] Email atualizado no Firebase Auth: {update_dict['email']}")
        except Exception as e:
            print(f"[PROFILE] Erro ao atualizar email no Firebase Auth: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao atualizar email: {str(e)}"
            )

    # Adiciona a data de atualização
    update_dict["updated_at"] = datetime.now(timezone.utc)

    db = profile_service._get_db()
    if not db:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Banco de dados não disponível."
        )

    # Atualiza o documento no Firestore
    user_ref = db.collection("users").document(current_user.id)
    user_ref.update(update_dict)

    # Busca o documento atualizado para retornar
    updated_user_doc = user_ref.get()
    if not updated_user_doc.exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Falha ao recuperar perfil atualizado."
        )
    
    updated_user_data = updated_user_doc.to_dict()

    return ApiResponse(
        success=True,
        message="Perfil atualizado com sucesso.",
        data=updated_user_data
    )

    #Deleta o perfil do usuário logado do Firestore e Firebase Auth
@router.delete("/me", response_model=ApiResponse)
async def delete_my_profile(current_user: UserProfile = Depends(get_current_user_firebase)):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    try:
        # Importa o Firebase Admin auth aqui para evitar dependências circulares
        from firebase_admin import auth as fb_auth

        db = profile_service._get_db()
        if not db:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Banco de dados não disponível."
            )

        # Deleta o usuário do Firestore
        user_ref = db.collection("users").document(current_user.id)
        user_ref.delete()

        # Deleta o usuário do Firebase Authentication
        fb_auth.delete_user(current_user.firebase_uid)

        return ApiResponse(
            success=True,
            message="Conta deletada com sucesso."
        )

    except Exception as e:
        print(f"[ERRO] Falha ao deletar usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar conta: {str(e)}"
        )