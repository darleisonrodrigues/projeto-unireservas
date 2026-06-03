from datetime import timedelta

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from models.profile import UserCreate, LoginRequest, ApiResponse
from services.profile_service import ProfileService
from utils.auth import create_access_token, verify_token
from config.settings import settings


router = APIRouter()
profile_service = ProfileService()
security = HTTPBearer()

 #Registrar novo usuário
@router.post("/register", response_model=ApiResponse)
async def register(user_data: UserCreate):
    try:
        print(f"Dados recebidos: {user_data.model_dump()}")

        # Obter tipo de usuário com compatibilidade frontend/backend
        user_type = user_data.get_user_type()
        print(f"Tipo de usuário identificado: {user_type}")

        if not user_type:
            print("Tipo de usuário não encontrado")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de usuário é obrigatório (userType ou user_type)"
            )

        # Verificar se email já existe
        existing_user = profile_service.get_user_by_email(user_data.email)
        if existing_user:
            print(f"Email já existe: {user_data.email}")
            print(f"Dados do usuário existente: {existing_user}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email já cadastrado: {user_data.email}. Tente com outro email."
            )

        # Validar campos obrigatórios baseado no tipo de usuário
        if user_type == "student":
            print(f"Validando estudante - University: {user_data.university}")
            if not user_data.university:
                print("University obrigatória para estudante")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Campo obrigatório para estudante: university"
                )
        elif user_type == "advertiser":
            company_name = user_data.get_company_name()
            print(f"Validando anunciante - Company: {company_name}")
            if not company_name:
                print("CompanyName obrigatório para anunciante")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Campo obrigatório para anunciante: companyName"
                )

        print("[OK] Validações passaram - Criando usuário...")

        # Criar usuário
        new_user = profile_service.create_user(user_data)

        print(f"[OK] Usuário criado com sucesso: {new_user.id}")

        # Criar tokens para o usuário recém-criado
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.id},
            expires_delta=access_token_expires
        )

        refresh_token_expires = timedelta(days=7)
        refresh_token = create_access_token(
            data={"sub": new_user.id, "type": "refresh"},
            expires_delta=refresh_token_expires
        )

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
                "user": user_response,
                "token": access_token,
                "refreshToken": refresh_token
            }
        )

    except HTTPException as e:
        print(f"HTTPException: {e.detail}")
        raise
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        ) from e


@router.post("/login", response_model=ApiResponse)
async def login(login_data: LoginRequest):
    try:
        print(f"🚀 INICIO LOGIN - Email: {login_data.email}")
        print(f"🔍 Tentativa de login para: {login_data.email}")

        # Buscar usuário por email
        user_data = profile_service.get_user_by_email(login_data.email)
        if not user_data:
            print(f"Usuário não encontrado: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )

        print(f"[OK] Usuário encontrado: {user_data.get('email')}")

        # Verificar senha
        if not profile_service.verify_password(login_data.password, user_data["password"]):
            print(f"Senha incorreta para: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )

        print("[OK] Senha verificada com sucesso")

        # Verificar se usuário está ativo
        if not user_data.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conta desativada"
            )

        # Criar token de acesso e refresh token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["id"]},
            expires_delta=access_token_expires
        )

        # Criar refresh token com validade maior
        refresh_token_expires = timedelta(days=7)  # 7 dias
        refresh_token = create_access_token(
            data={"sub": user_data["id"], "type": "refresh"},
            expires_delta=refresh_token_expires
        )

        print("Buscando dados completos do usuário...")

        # Buscar dados completos do usuário (sem senha)
        user_profile = profile_service.get_user_by_id(user_data["id"])
        if not user_profile:
            print(f"Falha ao buscar perfil completo: {user_data['id']}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao carregar dados do usuário"
            )

        print(f"[OK] Perfil carregado: {user_profile.name}")

        # Montar forma compatível com frontend (token, refreshToken, user)
        user_payload = {
            "id": user_profile.id,
            "email": user_profile.email,
            "name": user_profile.name,
            "userType": user_profile.user_type,
        }

        print("[OK] Login processado com sucesso")

        return ApiResponse(
            success=True,
            data={
                "token": access_token,
                "refreshToken": refresh_token,
                "user": user_payload,
            },
            message="Login realizado com sucesso"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno do servidor: {str(e)}"
        ) from e

    #Fazer logout (no frontend deve remover o token)
@router.post("/logout", response_model=ApiResponse)
async def logout():
    return ApiResponse(
        success=True,
        message="Logout realizado com sucesso"
    )

    #Obter informações do usuário atual
@router.get("/me", response_model=ApiResponse)
async def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Decodifica o token e retorna dados básicos do usuário
    try:
        user_id = verify_token(credentials)
        user = profile_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")
        user_payload = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "userType": user.user_type,
        }
        return ApiResponse(success=True, data=user_payload)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/verify-token", response_model=ApiResponse)
@router.post("/verify-token", response_model=ApiResponse)
async def verify_token_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        user_id = verify_token(credentials)
        user = profile_service.get_user_by_id(user_id)
        if not user:
            return ApiResponse(success=False, message="Token inválido ou usuário não encontrado")
        user_payload = {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "userType": user.user_type,
        }
        return ApiResponse(success=True, data={"valid": True, "user": user_payload})
    except HTTPException:
        return ApiResponse(success=False, message="Token inválido")


@router.post("/refresh", response_model=ApiResponse)
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Verificar se é um refresh token válido
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

        # Criar novos tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": user_id},
            expires_delta=access_token_expires,
        )

        refresh_token_expires = timedelta(days=7)
        new_refresh_token = create_access_token(
            data={"sub": user_id, "type": "refresh"},
            expires_delta=refresh_token_expires,
        )

        return ApiResponse(
            success=True,
            data={
                "token": new_access_token,
                "refreshToken": new_refresh_token
            }
        )
    except JWTError:
        return ApiResponse(success=False, message="Token inválido")
    except HTTPException:
        return ApiResponse(success=False, message="Não foi possível renovar o token")
