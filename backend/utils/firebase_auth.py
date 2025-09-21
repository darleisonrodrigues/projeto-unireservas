# projeto-unireservas/backend/utils/firebase_auth.py

from fastapi import Depends, HTTPException, Header, status
from typing import Optional, Dict, Any, Union
import firebase_admin
from firebase_admin import auth as fb_auth
from services.profile_service import ProfileService
from models.profile import StudentProfile, AdvertiserProfile



# Criação de usuario no Firebase Authentication
def create_firebase_user(email: str, password: str, display_name: str) -> str:
    """
    Cria um usuário no Firebase Authentication e retorna o UID.
    """
    try:
        user = fb_auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
        )
        return user.uid
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar usuário no Firebase: {str(e)}"
        )



# Funções auxiliares para verificar token e usuário atual

def _extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header ausente"
        )
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato inválido do Authorization header. Use: Bearer <token>"
        )
    return parts[1]


def verify_firebase_token(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    
    try:
        token = _extract_bearer_token(authorization)
        # Adicionar tolerância para clock skew (10 segundos)
        decoded = fb_auth.verify_id_token(token, clock_skew_seconds=10)
        return decoded
    except firebase_admin._auth_utils.InvalidIdTokenError:
        print("[ERRO] ID token invalido")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ID token inválido")
    except firebase_admin._auth_utils.ExpiredIdTokenError:
        print("[ERRO] ID token expirado")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ID token expirado")
    except firebase_admin._auth_utils.RevokedIdTokenError:
        print("[ERRO] ID token revogado")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="ID token revogado")
    except Exception as e:
        import traceback
        print("[ERRO] Erro inesperado ao verificar token:", str(e))
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Falha na verificação do token: {str(e)}"
        )


def get_current_user_firebase(
    token_data: Dict[str, Any] = Depends(verify_firebase_token),
):
    uid = token_data.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UID ausente no token"
        )

    profile_service = ProfileService()
    user = profile_service.get_user_by_firebase_uid(uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado no sistema"
        )
    return user


def get_current_advertiser_firebase(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user_firebase)
) -> AdvertiserProfile:
    
    if current_user.user_type != "advertiser":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: apenas anunciantes podem criar propriedades"
        )
    return current_user
