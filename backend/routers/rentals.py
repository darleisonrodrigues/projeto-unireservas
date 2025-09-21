
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Union, List
from models.rental import RentalInterest, RentalInterestResponse
from models.profile import StudentProfile, AdvertiserProfile
from services.rental_service import rental_service
from utils.firebase_auth import get_current_user_firebase, get_current_advertiser_firebase


router = APIRouter()

    #Demonstrar interesse em uma propriedade (apenas estudantes)
@router.post("/interest", response_model=RentalInterestResponse, status_code=status.HTTP_201_CREATED)
async def express_interest(
    interest_data: RentalInterest,
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        new_interest = rental_service.express_interest(
            property_id=interest_data.property_id,
            student_id=current_user.id,
            message=interest_data.message
        )
        return RentalInterestResponse(**new_interest)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao demonstrar interesse: {str(e)}"
        )

    #Buscar interesses do estudante atual
@router.get("/interests/my", response_model=List[RentalInterestResponse])
async def get_my_interests(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
):
    try:
        interests = rental_service.get_student_interests(current_user.id)
        return [RentalInterestResponse(**interest) for interest in interests]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar interesses: {str(e)}"
        )

    #Buscar interesses recebidos pelo anunciante atual
@router.get("/interests/received", response_model=List[RentalInterestResponse])
async def get_received_interests(
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    try:
        interests = rental_service.get_advertiser_interests(current_user.id)
        return [RentalInterestResponse(**interest) for interest in interests]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar interesses: {str(e)}"
        )

   #Atualizar status de um interesse (apenas anunciantes)
@router.patch("/interests/{interest_id}/status")
async def update_interest_status(
    interest_id: str,
    status: str,
    current_user: AdvertiserProfile = Depends(get_current_advertiser_firebase)
):
    valid_statuses = ["pending", "accepted", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Use: {', '.join(valid_statuses)}"
        )

    try:
        updated_interest = rental_service.update_interest_status(
            interest_id=interest_id,
            status=status,
            advertiser_id=current_user.id
        )
        return {"message": f"Status atualizado para: {status}", "interest": updated_interest}
    except Exception as e:
        if "permissão" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar status: {str(e)}"
        )