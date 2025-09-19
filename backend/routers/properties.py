"""
Rotas para propriedades
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional, Union

from models.property import (
    Property, PropertyCreate, PropertyUpdate, PropertyResponse, 
    PropertiesListResponse, FilterState
)
from models.profile import StudentProfile, AdvertiserProfile
from services.property_service import PropertyService
from utils.auth import get_current_active_user, get_current_advertiser


router = APIRouter()
property_service = PropertyService()


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    #Criar nova propriedade (apenas anunciantes)
    try:
        new_property = property_service.create_property(property_data, current_user.id)
        return new_property
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar propriedade: {str(e)}"
        )


@router.get("/", response_model=PropertiesListResponse)
async def list_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    property_type: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None, gt=0),
    location: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("relevancia"),
    search_term: Optional[str] = Query(None),
    amenities: Optional[str] = Query(None)  # Lista separada por vírgula
):
    #Listar propriedades com filtros
    try:
        # Processar amenities
        amenities_list = []
        if amenities:
            amenities_list = [a.strip() for a in amenities.split(",") if a.strip()]
        
        # Criar filtros
        filters = FilterState(
            property_type=property_type,
            max_price=max_price,
            location=location,
            sort_by=sort_by,
            search_term=search_term,
            amenities=amenities_list
        )
        
        result = property_service.get_properties(
            page=page,
            per_page=per_page,
            filters=filters
        )
        
        return PropertiesListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar propriedades: {str(e)}"
        )


@router.get("/my", response_model=PropertiesListResponse)
async def list_my_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    try:
        result = property_service.get_properties(
            page=page,
            per_page=per_page,
            owner_id=current_user.id
        )
        
        return PropertiesListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar suas propriedades: {str(e)}"
        )


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: str):
    try:
        property_data = property_service.get_property(property_id)
        if not property_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
        return property_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar propriedade: {str(e)}"
        )


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    #Atualizar propriedade
    try:
        updated_property = property_service.update_property(
            property_id, property_data, current_user.id
        )
        if not updated_property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
        return updated_property
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar esta propriedade"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar propriedade: {str(e)}"
        )


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    #Deletar propriedade
    try:
        success = property_service.delete_property(property_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para deletar esta propriedade"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar propriedade: {str(e)}"
        )


@router.post("/{property_id}/favorite")
async def toggle_favorite(
    property_id: str,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_active_user)
):
    #Alternar favorito da propriedad
    try:
        is_favorited = property_service.toggle_favorite(property_id, current_user.id)
        return {
            "property_id": property_id,
            "is_favorited": is_favorited,
            "message": "Favorito atualizado"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar favorito: {str(e)}"
        )


@router.get("/search/", response_model=PropertiesListResponse)
async def search_properties(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50)
):
    #Buscar propriedades por termo
    try:
        result = property_service.search_properties(q, page, per_page)
        return PropertiesListResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na busca: {str(e)}"
        )