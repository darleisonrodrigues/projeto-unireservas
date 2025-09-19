"""
Rotas para listings
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, UploadFile, File
from typing import Optional, List

from models.listing import (
    Listing, ListingCreate, ListingUpdate, ListingResponse, 
    ListingsListResponse, PhotoUploadResponse
)
from models.profile import AdvertiserProfile
from services.listing_service import ListingService
from utils.auth import get_current_advertiser


router = APIRouter()
listing_service = ListingService()


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    try:
        new_listing = listing_service.create_listing(listing_data, current_user.id)
        return new_listing
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar listing: {str(e)}"
        )


@router.get("/", response_model=ListingsListResponse)
async def list_listings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    property_type: Optional[str] = Query(None),
    university: Optional[str] = Query(None),
    is_active: bool = Query(True)
):
    try:
        result = listing_service.get_listings(
            page=page,
            per_page=per_page,
            property_type=property_type,
            university=university,
            is_active=is_active
        )
        
        return ListingsListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar listings: {str(e)}"
        )


@router.get("/my", response_model=ListingsListResponse)
async def list_my_listings(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    is_active: Optional[bool] = Query(None),
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    #Listar listings do usuário atual
    try:
        result = listing_service.get_listings(
            page=page,
            per_page=per_page,
            user_id=current_user.id,
            is_active=is_active
        )
        
        return ListingsListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar seus listings: {str(e)}"
        )


@router.get("/university/{university}", response_model=ListingsListResponse)
async def list_listings_by_university(
    university: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50)
):
    try:
        result = listing_service.get_listings_by_university(
            university=university,
            page=page,
            per_page=per_page
        )
        
        return ListingsListResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar listings da universidade: {str(e)}"
        )

    #Obter listing por ID
@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str):
    try:
        listing = listing_service.get_listing(listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing não encontrado"
            )
        return listing
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar listing: {str(e)}"
        )


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    listing_data: ListingUpdate,
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    #Atualizar listing
    try:
        updated_listing = listing_service.update_listing(
            listing_id, listing_data, current_user.id
        )
        if not updated_listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing não encontrado"
            )
        return updated_listing
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para editar este listing"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar listing: {str(e)}"
        )


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(
    listing_id: str,
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    try:
        success = listing_service.delete_listing(listing_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing não encontrado"
            )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para deletar este listing"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar listing: {str(e)}"
        )


@router.post("/{listing_id}/photos", response_model=List[PhotoUploadResponse])
async def upload_photos(
    listing_id: str,
    files: List[UploadFile] = File(...),
    current_user: AdvertiserProfile = Depends(get_current_advertiser)
):
    """Upload de fotos para o listing"""
    try:
        # Verificar se o listing existe e pertence ao usuário
        listing = listing_service.get_listing(listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing não encontrado"
            )
        
        if listing.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para fazer upload neste listing"
            )
        
        # TODO: Implementar upload real para Firebase Storage ou serviço de imagens
        # Por enquanto, retorna URLs fictícias
        uploaded_photos = []
        for i, file in enumerate(files):
            # Validar tipo de arquivo
            if not file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Arquivo {file.filename} não é uma imagem válida"
                )
            
            # Simular upload
            photo_url = f"https://storage.googleapis.com/unireservas/{listing_id}/photo_{i}_{file.filename}"
            uploaded_photos.append(PhotoUploadResponse(
                url=photo_url,
                filename=file.filename
            ))
        
        # Atualizar URLs das fotos no listing
        photo_urls = [photo.url for photo in uploaded_photos]
        listing_service.update_photos(listing_id, photo_urls, current_user.id)
        
        return uploaded_photos
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro no upload de fotos: {str(e)}"
        )


@router.get("/search/", response_model=ListingsListResponse)
async def search_listings(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50)
):
    """Buscar listings por termo"""
    try:
        result = listing_service.search_listings(q, page, per_page)
        return ListingsListResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na busca: {str(e)}"
        )