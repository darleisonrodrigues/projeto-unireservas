"""
Rotas para perfis de usuário
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Union

from models.profile import (
    StudentProfile, AdvertiserProfile, ProfileUpdateRequest, ApiResponse
)
from services.profile_service import ProfileService
from utils.auth import get_current_active_user, get_current_student


router = APIRouter()
profile_service = ProfileService()


@router.get("/me", response_model=Union[StudentProfile, AdvertiserProfile])
async def get_my_profile(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_active_user)
):
    """Obter perfil do usuário atual"""
    return current_user


@router.put("/me", response_model=Union[StudentProfile, AdvertiserProfile])
async def update_my_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_active_user)
):
    #Atualizar perfil do usuário atual
    try:
        updated_profile = profile_service.update_profile(current_user.id, profile_data)
        if not updated_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil não encontrado"
            )
        return updated_profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )


@router.get("/{user_id}", response_model=Union[StudentProfile, AdvertiserProfile])
async def get_user_profile(user_id: str):
    try:
        user_profile = profile_service.get_user_by_id(user_id)
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Remover informações sensíveis para visualização pública
        if isinstance(user_profile, StudentProfile):
            # Para estudantes, manter apenas informações básicas
            public_profile = StudentProfile(
                id=user_profile.id,
                name=user_profile.name,
                email="",  # Não mostrar email
                phone="",  # Não mostrar telefone
                profile_image=user_profile.profile_image,
                user_type=user_profile.user_type,
                university=user_profile.university,
                course=user_profile.course,
                semester=user_profile.semester,
                bio=user_profile.bio,
                created_at=user_profile.created_at,
                updated_at=user_profile.updated_at,
                is_active=user_profile.is_active,
                preferences=user_profile.preferences,
                favorite_properties=[]  # Não mostrar favoritos
            )
            return public_profile
        else:
            # Para anunciantes, mostrar informações de contato
            return user_profile
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar perfil: {str(e)}"
        )


@router.post("/favorites/{property_id}", response_model=ApiResponse)
async def add_favorite_property(
    property_id: str,
    current_user: StudentProfile = Depends(get_current_student)
):
    try:
        success = profile_service.add_favorite_property(current_user.id, property_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível adicionar aos favoritos"
            )
        
        return ApiResponse(
            success=True,
            message="Propriedade adicionada aos favoritos"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar favorito: {str(e)}"
        )


@router.delete("/favorites/{property_id}", response_model=ApiResponse)
async def remove_favorite_property(
    property_id: str,
    current_user: StudentProfile = Depends(get_current_student)
):
    try:
        success = profile_service.remove_favorite_property(current_user.id, property_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível remover dos favoritos"
            )
        
        return ApiResponse(
            success=True,
            message="Propriedade removida dos favoritos"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao remover favorito: {str(e)}"
        )


@router.get("/favorites/list")
async def get_favorite_properties(
    current_user: StudentProfile = Depends(get_current_student)
):
    try:
        favorites = profile_service.get_user_favorites(current_user.id)
        return {
            "user_id": current_user.id,
            "favorite_properties": favorites,
            "total": len(favorites)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar favoritos: {str(e)}"
        )


@router.delete("/me", response_model=ApiResponse)
async def deactivate_my_account(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_active_user)
):
    try:
        success = profile_service.deactivate_user(current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível desativar a conta"
            )
        
        return ApiResponse(
            success=True,
            message="Conta desativada com sucesso"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao desativar conta: {str(e)}"
        )