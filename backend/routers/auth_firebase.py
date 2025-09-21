# Conteúdo FINAL e DEFINITIVO para: projeto-unireservas/backend/routers/auth_firebase.py

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
import uuid
import logging
import traceback
from models.profile import UserCreate, ApiResponse, StudentProfile, AdvertiserProfile, Preferences
from services.profile_service import ProfileService
from utils.firebase_auth import create_firebase_user, verify_firebase_token, get_current_user_firebase

router = APIRouter()
profile_service = ProfileService()
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@router.post("/register-simple")
async def register_simple():
    print("[REGISTRO-SIMPLE] Endpoint chamado!")
    return {"status": "simple_ok"}

@router.post("/register", response_model=ApiResponse)
async def register_firebase(user_data: UserCreate):
    try:
        print(f"[REGISTRO] Dados recebidos: {user_data}")
        logger.info(f"[REGISTRO] Iniciando registro para: {user_data.email}")

        print(f"[REGISTRO] user_type: {user_data.user_type}")

        # Para login social (sem senha)
        is_social_login = not user_data.password or user_data.password == ""
        if is_social_login:
            print("[REGISTRO] Login social detectado - aplicando valores padrão")
            if user_data.user_type == "student" and not user_data.university:
                user_data.university = "ufmg"  # Definir universidade padrão para login social
                print(f"[REGISTRO] University padrão definida: {user_data.university}")

        if user_data.user_type == "student" and not user_data.university:
            print("[REGISTRO] ERRO: university obrigatória para student")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campo obrigatório para estudante: university")
        if user_data.user_type == "advertiser" and not user_data.company_name:
            print("[REGISTRO] ERRO: company_name obrigatória para advertiser")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Campo obrigatório para anunciante: companyName")

        print("[REGISTRO] Verificando se email já existe...")
        existing_user = profile_service.get_user_by_email(user_data.email)
        if existing_user:
            print(f"[REGISTRO] ERRO: Email já existe: {user_data.email}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Email já cadastrado: {user_data.email}")

        # Verificar se firebase_uid foi fornecido pelo frontend
        firebase_uid = user_data.firebase_uid
        if firebase_uid:
            print(f"[REGISTRO] Firebase UID recebido do frontend: {firebase_uid}")
        else:
            print("[REGISTRO] ERRO: firebase_uid não fornecido")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="firebase_uid é obrigatório")

        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        db = profile_service._get_db()
        if not db:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Banco de dados não disponível")

        # Criar perfil baseado no tipo de usuário
        if user_data.user_type == "student":
            new_user_profile = StudentProfile(
                id=user_id,
                firebase_uid=firebase_uid,
                name=user_data.name,
                email=user_data.email,
                phone=user_data.phone or "Não informado",
                user_type='student',
                created_at=now,
                updated_at=now,
                is_active=True,
                university=user_data.university,
                course=user_data.course or "Não informado",
                semester=user_data.semester or "Não informado",
                bio="",
                preferences=Preferences(),
                favorite_properties=[]
            )
        else:
            new_user_profile = AdvertiserProfile(
                id=user_id,
                firebase_uid=firebase_uid,
                name=user_data.name,
                email=user_data.email,
                phone=user_data.phone or "Não informado",
                user_type='advertiser',
                created_at=now,
                updated_at=now,
                is_active=True,
                company_name=user_data.company_name,
                cnpj=user_data.cnpj or "",
                description=user_data.description or "",
                address=user_data.address or "",
                website=user_data.website,
                verified=False,
                rating=0.0,
                total_properties=0,
                properties=[]
            )

        print("[REGISTRO] Salvando no Firestore...")
        db.collection("users").document(user_id).set(new_user_profile.model_dump())
        print(f"[REGISTRO] Usuário {user_id} salvo com sucesso no Firestore.")

        user_response = {
            "id": new_user_profile.id,
            "name": new_user_profile.name,
            "email": new_user_profile.email,
            "userType": new_user_profile.user_type,
            "firebase_uid": firebase_uid
        }

        return ApiResponse(success=True, message="Usuário criado com sucesso", data={"user": user_response})

    except HTTPException as e:
        logger.error(f"[REGISTRO] HTTPException: {e.detail}")
        raise
    except Exception as e:
        logger.error(f"[REGISTRO] Erro inesperado: {str(e)}")
        logger.error(f"[REGISTRO] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor: {str(e)}")


@router.post("/verify-token", response_model=ApiResponse)
async def verify_token_firebase(token_data: dict = Depends(verify_firebase_token)):
    try:
        firebase_uid = token_data.get("uid")
        user = profile_service.get_user_by_firebase_uid(firebase_uid)
        if not user:
            return ApiResponse(success=False, message="Usuário não encontrado no sistema")
        user_payload = { "id": user.id, "email": user.email, "name": user.name, "userType": user.user_type, "firebase_uid": firebase_uid }
        return ApiResponse(success=True, data={"valid": True, "user": user_payload})
    except Exception as e:
        return ApiResponse(success=False, message="Token inválido")

@router.get("/me", response_model=ApiResponse)
async def get_current_user_info_firebase(current_user=Depends(get_current_user_firebase)):
    try:
        user_data = current_user.model_dump()
        if 'user_type' in user_data:
            user_data['userType'] = user_data.pop('user_type')
        return ApiResponse(success=True, data=user_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/logout", response_model=ApiResponse)
async def logout_firebase():
    return ApiResponse(success=True, message="Logout realizado com sucesso")

@router.post("/test")
async def test_endpoint():
    print("[TEST] Endpoint de teste chamado!")
    return {"status": "test_ok"}

@router.post("/test-user-create")
async def test_user_create(user_data: UserCreate):
    print(f"[TEST] UserCreate recebido: {user_data}")
    return {"status": "user_create_ok", "data": user_data.model_dump()}