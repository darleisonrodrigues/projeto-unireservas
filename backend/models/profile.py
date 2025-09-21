
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


class Preferences(BaseModel):
    budget: Optional[str] = ""
    room_type: Optional[str] = None
    amenities: List[str] = []
    location: Optional[str] = ""
    max_distance: Optional[int] = None


class StudentProfile(BaseModel):
    id: str
    firebase_uid: str
    name: str
    email: str
    phone: str
    user_type: Literal["student"]
    created_at: datetime
    updated_at: datetime
    is_active: bool
    university: str
    course: Optional[str] = "Não informado"
    semester: Optional[str] = "Não informado"
    bio: Optional[str] = ""
    preferences: Preferences = Field(default_factory=Preferences)
    favorite_properties: List[str] = []


class AdvertiserProfile(BaseModel):
    id: str
    firebase_uid: str
    name: str
    email: str
    phone: str
    user_type: Literal["advertiser"]
    created_at: datetime
    updated_at: datetime
    is_active: bool
    company_name: str
    cnpj: Optional[str] = ""
    description: Optional[str] = ""
    address: Optional[str] = ""
    website: Optional[str] = None
    verified: bool = False
    rating: float = 0.0
    total_properties: int = 0
    properties: List[str] = []


class UserCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    email: str
    password: str
    phone: Optional[str] = None
    user_type: Literal["student", "advertiser"] = Field(..., alias="userType")
    firebase_uid: Optional[str] = None  # Firebase UID fornecido pelo frontend
    university: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    company_name: Optional[str] = Field(None, alias="companyName")
    cnpj: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None


class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None


class ProfileUpdateRequest(BaseModel):
    """Modelo para atualizar o perfil de um usuário."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    university: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    bio: Optional[str] = None
    preferences: Optional[Preferences] = None
    company_name: Optional[str] = Field(None, alias="companyName")
    cnpj: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None

    # Config para permitir que o frontend envie 'companyName' em camelCase
    model_config = ConfigDict(populate_by_name=True)

class LoginRequest(BaseModel):
    """Modelo para o corpo do pedido de login."""
    username: str
    password: str


class LoginResponseUser(BaseModel):
    """Sub-modelo para os dados do usuário na resposta de login."""
    id: str
    name: str
    email: str
    user_type: str = Field(..., alias="userType")


class LoginResponse(BaseModel):
    """Modelo para a resposta de login bem-sucedido."""
    access_token: str
    token_type: str
    user: LoginResponseUser