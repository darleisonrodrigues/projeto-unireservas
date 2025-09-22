from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.rental import ReservationCreate, ReservationUpdate, ReservationResponse, ApiResponse
from services.reservation_service import reservation_service
from utils.firebase_auth import get_current_user_firebase
from models.profile import StudentProfile, AdvertiserProfile

router = APIRouter()

    #Criar nova reserva (apenas estudantes)
@router.post("/", response_model=ApiResponse)
async def create_reservation(
    reservation_data: ReservationCreate,
    current_user = Depends(get_current_user_firebase)
):
    try:
        print(f"[RESERVATIONS] Criando reserva para propriedade: {reservation_data.property_id}")

        # Verificar se o usuário é estudante
        if current_user.user_type != "student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas estudantes podem fazer reservas"
            )

        reservation = reservation_service.create_reservation(reservation_data, current_user.id)

        return ApiResponse(
            success=True,
            message="Reserva criada com sucesso",
            data={"reservation": reservation}
        )

    except Exception as e:
        print(f"[RESERVATIONS] Erro ao criar reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    #Buscar reservas do usuário (estudante ou anunciante)
@router.get("/my", response_model=ApiResponse)
async def get_my_reservations(current_user = Depends(get_current_user_firebase)):
    """Buscar reservas do usuário (estudante ou anunciante)"""
    try:
        print(f"[RESERVATIONS] Buscando reservas do usuário: {current_user.id}")

        reservations = reservation_service.get_user_reservations(current_user.id, current_user.user_type)

        return ApiResponse(
            success=True,
            data={
                "reservations": [res.model_dump() for res in reservations],
                "total": len(reservations)
            }
        )

    except Exception as e:
        print(f"[RESERVATIONS] Erro ao buscar reservas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

    #Buscar reserva específica por ID
@router.get("/{reservation_id}", response_model=ApiResponse)
async def get_reservation(
    reservation_id: str,
    current_user = Depends(get_current_user_firebase)
):
    try:
        print(f"[RESERVATIONS] Buscando reserva: {reservation_id}")

        reservation = reservation_service.get_reservation_by_id(reservation_id, current_user.id)

        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada"
            )

        return ApiResponse(
            success=True,
            data={"reservation": reservation.model_dump()}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[RESERVATIONS] Erro ao buscar reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
    #Atualizar reserva
@router.put("/{reservation_id}", response_model=ApiResponse)
async def update_reservation(
    reservation_id: str,
    update_data: ReservationUpdate,
    current_user = Depends(get_current_user_firebase)
):
    try:
        print(f"[RESERVATIONS] Atualizando reserva: {reservation_id}")

        updated_reservation = reservation_service.update_reservation(
            reservation_id, update_data, current_user.id
        )

        if not updated_reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada"
            )

        return ApiResponse(
            success=True,
            message="Reserva atualizada com sucesso",
            data={"reservation": updated_reservation.model_dump()}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[RESERVATIONS] Erro ao atualizar reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    #Cancelar reserva
@router.patch("/{reservation_id}/cancel", response_model=ApiResponse)
async def cancel_reservation(
    reservation_id: str,
    current_user = Depends(get_current_user_firebase)
):
    try:
        print(f"[RESERVATIONS] Cancelando reserva: {reservation_id}")

        success = reservation_service.cancel_reservation(reservation_id, current_user.id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada"
            )

        return ApiResponse(
            success=True,
            message="Reserva cancelada com sucesso"
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[RESERVATIONS] Erro ao cancelar reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    #Confirmar reserva (apenas anunciantes)
@router.patch("/{reservation_id}/confirm", response_model=ApiResponse)
async def confirm_reservation(
    reservation_id: str,
    current_user = Depends(get_current_user_firebase)
):
    try:
        print(f"[RESERVATIONS] Confirmando reserva: {reservation_id}")

        if current_user.user_type != "advertiser":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas anunciantes podem confirmar reservas"
            )

        update_data = ReservationUpdate(status="confirmed")
        updated_reservation = reservation_service.update_reservation(
            reservation_id, update_data, current_user.id
        )

        if not updated_reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada"
            )

        return ApiResponse(
            success=True,
            message="Reserva confirmada com sucesso",
            data={"reservation": updated_reservation.model_dump()}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[RESERVATIONS] Erro ao confirmar reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    #Rejeitar reserva (apenas anunciantes)
@router.patch("/{reservation_id}/reject", response_model=ApiResponse)
async def reject_reservation(
    reservation_id: str,
    current_user = Depends(get_current_user_firebase)
):
    try:
        print(f"[RESERVATIONS] Rejeitando reserva: {reservation_id}")

        if current_user.user_type != "advertiser":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas anunciantes podem rejeitar reservas"
            )

        update_data = ReservationUpdate(status="rejected")
        updated_reservation = reservation_service.update_reservation(
            reservation_id, update_data, current_user.id
        )

        if not updated_reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reserva não encontrada"
            )

        return ApiResponse(
            success=True,
            message="Reserva rejeitada",
            data={"reservation": updated_reservation.model_dump()}
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[RESERVATIONS] Erro ao rejeitar reserva: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )