
from fastapi import APIRouter, HTTPException, status, Depends, Query, File, UploadFile, Header
from typing import Optional, Union, List
import datetime
import os

from models.property import (Property, PropertyCreate, PropertyUpdate, PropertyResponse,PropertiesListResponse, FilterState)
from models.profile import StudentProfile, AdvertiserProfile
from services.property_service import PropertyService
from utils.firebase_auth import get_current_user_firebase, get_current_advertiser_firebase
from config.firebase_config import get_storage_bucket


router = APIRouter()
property_service = PropertyService()

    #Criar nova propriedade (apenas anunciantes)
@router.post("/", response_model=Property, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        new_property = property_service.create_property(property_data, current_user.id)
        return Property(**new_property)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar propriedade: {str(e)}"
        )


#Faz upload de imagens para uma propriedade (apenas pelo proprietário)
@router.post("/{property_id}/upload-images", status_code=status.HTTP_200_OK)
async def upload_property_images(
    property_id: str,
    files: List[UploadFile] = File(...),
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):

    # Valida se a propriedade existe e pertence ao usuario
    property_data = property_service.get_property_by_id(property_id)
    if not property_data or property_data.get("owner_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propriedade não encontrada ou você não tem permissão"
        )

    image_urls = []

    # Tentar Firebase Storage primeiro, se falhar usar armazenamento local
    bucket = get_storage_bucket()
    use_local_storage = False

    if not bucket:
        print("[WARNING] Firebase Storage nao configurado, usando armazenamento local")
        use_local_storage = True

    for file in files:
        # Pula arquivos que não sao do tipo imagem
        if not file.content_type or not file.content_type.startswith('image/'):
            continue

        try:
            # Cria um nome de arquivo único para evitar conflitos
            timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')
            safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"

            if use_local_storage:
                # Upload local como fallback
                upload_dir = os.path.join("uploads", "properties", property_id)
                os.makedirs(upload_dir, exist_ok=True)

                file_path = os.path.join(upload_dir, safe_filename)

                # Salvar arquivo localmente
                with open(file_path, "wb") as buffer:
                    content = await file.read()
                    buffer.write(content)

                # URL local para servir a imagem
                image_url = f"http://localhost:8000/uploads/properties/{property_id}/{safe_filename}"
                image_urls.append(image_url)
                print(f"[OK] Arquivo salvo localmente: {file_path}")

            else:
                # Tentar Firebase Storage
                filename = f"properties/{property_id}/{safe_filename}"
                blob = bucket.blob(filename)

                # Reset file position
                await file.seek(0)

                # Faz o upload do arquivo para o Firebase Storage
                blob.upload_from_file(file.file, content_type=file.content_type)

                # Torna o arquivo publicamente acessível
                blob.make_public()

                image_urls.append(blob.public_url)
                print(f"[OK] Arquivo enviado para Firebase: {filename}")

        except Exception as e:
            print(f"[ERROR] Erro no upload de {file.filename}: {str(e)}")
            # Se Firebase falhar, tentar local
            if not use_local_storage:
                try:
                    print("[FALLBACK] Tentando upload local como fallback...")
                    upload_dir = os.path.join("uploads", "properties", property_id)
                    os.makedirs(upload_dir, exist_ok=True)

                    file_path = os.path.join(upload_dir, safe_filename)

                    # Reset file position
                    await file.seek(0)

                    # Salvar arquivo localmente
                    with open(file_path, "wb") as buffer:
                        content = await file.read()
                        buffer.write(content)

                    # URL local para servir a imagem
                    image_url = f"http://localhost:8000/uploads/properties/{property_id}/{safe_filename}"
                    image_urls.append(image_url)
                    print(f"[OK] Fallback: Arquivo salvo localmente: {file_path}")

                except Exception as local_error:
                    print(f"[ERROR] Erro no fallback local: {str(local_error)}")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Erro ao fazer upload do arquivo {file.filename}: {str(e)} (Fallback também falhou: {str(local_error)})"
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro ao fazer upload do arquivo {file.filename}: {str(e)}"
                )

    if not image_urls:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum arquivo de imagem válido foi enviado."
        )

    # Salva as novas URLs no documento da propriedade no Firestore
    try:
        updated_property = property_service.add_images_to_property(
            property_id, image_urls, current_user.id
        )
        return {"image_urls": image_urls, "property": updated_property}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar URLs das imagens: {str(e)}"
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
    amenities: Optional[str] = Query(None), 
    authorization: Optional[str] = Header(None)
):
    try:
        # Tentar extrair usuário do token para favoritos
        current_user_id = None
        if authorization and authorization.startswith("Bearer "):
            try:
                from utils.firebase_auth import verify_firebase_token
                decoded_token = verify_firebase_token(authorization)
                current_user_id = decoded_token.get("uid")
            except Exception as e:
                print(f"[WARNING] Erro ao decodificar token para favoritos: {e}")

        amenities_list = []
        if amenities:
            amenities_list = [a.strip() for a in amenities.split(",") if a.strip()]

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
            filters=filters,
            current_user_id=current_user_id
        )

        properties = [Property(**prop) for prop in result["properties"]]

        return PropertiesListResponse(
            properties=properties,
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result["total_pages"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar propriedades: {str(e)}"
        )


@router.get("/my", response_model=PropertiesListResponse)
async def list_my_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        result = property_service.get_properties(
            page=page,
            per_page=per_page,
            owner_id=current_user.id
        )

        properties = [Property(**prop) for prop in result["properties"]]

        return PropertiesListResponse(
            properties=properties,
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result["total_pages"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar suas propriedades: {str(e)}"
        )

    #Obter detalhes de uma propriedade específica
@router.get("/{property_id}", response_model=Property)
async def get_property(property_id: str):
    try:
        property_data = property_service.get_property_by_id(property_id)
        if not property_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
        return Property(**property_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar propriedade: {str(e)}"
        )

    #Atualizar propriedade (apenas pelo proprietário)
@router.put("/{property_id}", response_model=Property)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        updated_property = property_service.update_property(
            property_id, property_data, current_user.id
        )
        if not updated_property:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
        return Property(**updated_property)
    except HTTPException:
        raise
    except Exception as e:
        if "permissão" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar propriedade: {str(e)}"
        )

    #Deletar propriedade (apenas pelo proprietário)
@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        success = property_service.delete_property(property_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
    except HTTPException:
        raise
    except Exception as e:
        if "permissão" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar propriedade: {str(e)}"
        )


# Deletar imagens específicas de uma propriedade
@router.delete("/{property_id}/delete-images")
async def delete_property_images(
    property_id: str,
    image_data: dict,
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        # Validar se a propriedade existe e pertence ao usuário
        property_data = property_service.get_property_by_id(property_id)
        if not property_data or property_data.get("owner_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada ou você não tem permissão"
            )

        image_urls = image_data.get("image_urls", [])
        if not image_urls:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhuma URL de imagem fornecida"
            )

        success = property_service.delete_images_from_property(
            property_id, image_urls, current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao deletar imagens"
            )

        return {"message": f"{len(image_urls)} imagem(ns) deletada(s) com sucesso"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar imagens: {str(e)}"
        )


# Reordenar imagens de uma propriedade
@router.put("/{property_id}/reorder-images")
async def reorder_property_images(
    property_id: str,
    image_data: dict,
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        # Validar se a propriedade existe e pertence ao usuário
        property_data = property_service.get_property_by_id(property_id)
        if not property_data or property_data.get("owner_id") != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada ou você não tem permissão"
            )

        image_urls = image_data.get("image_urls", [])
        if not image_urls:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nenhuma URL de imagem fornecida"
            )

        success = property_service.reorder_property_images(
            property_id, image_urls, current_user.id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao reordenar imagens"
            )

        return {"message": "Imagens reordenadas com sucesso"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao reordenar imagens: {str(e)}"
        )


    #Adicionar propriedade aos favoritos
@router.post("/{property_id}/favorite")
async def add_to_favorites(
    property_id: str,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        success = property_service.toggle_favorite(property_id, current_user.id, True)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
        return {
            "property_id": property_id,
            "is_favorited": True,
            "message": "Propriedade adicionada aos favoritos"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar favorito: {str(e)}"
        )

    #Remover propriedade dos favoritos
@router.delete("/{property_id}/favorite")
async def remove_from_favorites(
    property_id: str,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        success = property_service.toggle_favorite(property_id, current_user.id, False)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propriedade não encontrada"
            )
        return {
            "property_id": property_id,
            "is_favorited": False,
            "message": "Propriedade removida dos favoritos"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao remover favorito: {str(e)}"
        )

    #Buscar propriedades por termo
@router.get("/search/", response_model=PropertiesListResponse)
async def search_properties(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50)
):
    try:
        result = property_service.search_properties(q, None, page, per_page)
        properties = [Property(**prop) for prop in result["properties"]]
        return PropertiesListResponse(
            properties=properties,
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result.get("total_pages", 1)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro na busca: {str(e)}"
        )