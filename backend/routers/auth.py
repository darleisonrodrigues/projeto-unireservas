"""
Rotas para autenticação
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from datetime import timedelta

from models.profile import UserCreate, LoginRequest, LoginResponse, ApiResponse
from services.profile_service import ProfileService
from utils.auth import create_access_token
from config.settings import settings


router = APIRouter()
profile_service = ProfileService()
security = HTTPBearer()

 #Registrar novo usuário
@router.post("/register", response_model=ApiResponse)
async def register(user_data: UserCreate):
    try:
        print(f"🔍 Dados recebidos: {user_data.model_dump()}")
        
        # Obter tipo de usuário com compatibilidade frontend/backend
        user_type = user_data.get_user_type()
        print(f"🔍 Tipo de usuário identificado: {user_type}")
        
        if not user_type:
            print("❌ Tipo de usuário não encontrado")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de usuário é obrigatório (userType ou user_type)"
            )
        
        # Verificar se email já existe
        existing_user = profile_service.get_user_by_email(user_data.email)
        if existing_user:
            print(f"❌ Email já existe: {user_data.email}")
            print(f"🔍 Dados do usuário existente: {existing_user}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email já cadastrado: {user_data.email}. Tente com outro email."
            )
        
        # Validar campos obrigatórios baseado no tipo de usuário
        if user_type == "student":
            print(f"🎓 Validando estudante - University: {user_data.university}")
            if not user_data.university:
                print("❌ University obrigatória para estudante")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Campo obrigatório para estudante: university"
                )
        elif user_type == "advertiser":
            company_name = user_data.get_company_name()
            print(f"🏢 Validando anunciante - Company: {company_name}")
            if not company_name:
                print("❌ CompanyName obrigatório para anunciante")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Campo obrigatório para anunciante: companyName"
                )
        
        print("✅ Validações passaram - Criando usuário...")
        
        # Criar usuário
        new_user = profile_service.create_user(user_data)
        
        print(f"✅ Usuário criado com sucesso: {new_user.id}")
        
        # Criar resposta de sucesso compatível com frontend
        user_response = {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "userType": new_user.user_type
        }
        
        return ApiResponse(
            success=True,
            message="Usuário criado com sucesso",
            data={
                "user_id": new_user.id,
                "user": user_response,
                "token": "fake_token_for_now",  # Temporário
                "refreshToken": "fake_refresh_token"  # Temporário
            }
        )
        
    except HTTPException as e:
        print(f"❌ HTTPException: {e.detail}")
        raise
    except Exception as e:
        print(f"❌ Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    try:
        # Buscar usuário por email
        user_data = profile_service.get_user_by_email(login_data.email)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verificar senha
        if not profile_service.verify_password(login_data.password, user_data["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verificar se usuário está ativo
        if not user_data.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conta desativada"
            )
        
        # Criar token de acesso
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["id"]},
            expires_delta=access_token_expires
        )
        
        # Buscar dados completos do usuário (sem senha)
        user_profile = profile_service.get_user_by_id(user_data["id"])
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        )

    #Fazer logout (no frontend deve remover o token)
@router.post("/logout", response_model=ApiResponse)
async def logout():
    return ApiResponse(
        success=True,
        message="Logout realizado com sucesso"
    )

    #Obter informações do usuário atual
@router.get("/me")
async def get_current_user_info(current_user = Depends(profile_service.get_user_by_id)):
    # Esta rota precisa do middleware de autenticação
    # Por enquanto retorna uma resposta básica
    return {"message": "Endpoint para informações do usuário atual"}