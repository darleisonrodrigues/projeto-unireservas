"""
Utilitários para autenticação JWT
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from config.settings import settings
from services.profile_service import ProfileService
from models.profile import StudentProfile, AdvertiserProfile


# Configuração do JWT
security = HTTPBearer()
profile_service = ProfileService()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    #Criar token JWT
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    #Verificar e decodificar token JWT
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    user_id: str = Depends(verify_token)
) -> Union[StudentProfile, AdvertiserProfile]:
    #$Obter usuário atual do token
    user = profile_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    return user


def get_current_active_user(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_user)
) -> Union[StudentProfile, AdvertiserProfile]:
    #Obter usuário ativo atual
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    return current_user


def get_current_student(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_active_user)
) -> StudentProfile:
    #Obter estudante atual (apenas estudantes)
    if current_user.user_type != "cliente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a estudantes"
        )
    return current_user


def get_current_advertiser(
    current_user: Union[StudentProfile, AdvertiserProfile] = Depends(get_current_active_user)
) -> AdvertiserProfile:
    #Obter anunciante atual (apenas anunciantes)
    if current_user.user_type != "anunciante":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a anunciantes"
        )
    return current_user