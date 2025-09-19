"""
Modelos para perfis de usuário
Baseado em src/types/profile.ts
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Union
from datetime import datetime


class UserType(str):
    #Tipos de usuário
    STUDENT = "student"
    ADVERTISER = "advertiser"


class StudentPreferences(BaseModel):
    #Preferências do estudante
    budget: Optional[str] = None
    room_type: Optional[Literal["kitnet", "quarto", "apartamento"]] = None
    amenities: List[str] = Field(default=[])
    location: Optional[str] = None
    max_distance: Optional[int] = Field(None, gt=0)


class User(BaseModel):
    #Modelo base de usuário
    id: Optional[str] = None
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(default="0000000000", min_length=10, max_length=20)
    profile_image: Optional[str] = None
    user_type: Literal["student", "advertiser"]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool = Field(default=True)

    class Config:
        from_attributes = True


class StudentProfile(User):
    #Perfil do estudante
    user_type: Literal["student"] = "student"
    university: str = Field(..., min_length=1, max_length=200)
    course: str = Field(default="Não informado", min_length=1, max_length=100)
    semester: str = Field(default="Não informado", min_length=1, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)
    preferences: StudentPreferences = Field(default_factory=StudentPreferences)
    favorite_properties: List[str] = Field(default=[])

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "João Silva",
                "email": "joao@email.com",
                "phone": "(11) 99999-9999",
                "user_type": "cliente",
                "university": "USP",
                "course": "Engenharia",
                "semester": "5º semestre",
                "bio": "Estudante de engenharia procurando moradia próxima ao campus",
                "preferences": {
                    "budget": "500-800",
                    "room_type": "quarto",
                    "amenities": ["wifi", "mobiliado"],
                    "max_distance": 1000
                }
            }
        }


class AdvertiserProfile(User):
    #Perfil do anunciante
    user_type: Literal["advertiser"] = "advertiser"
    company_name: str = Field(..., min_length=1, max_length=200)
    cnpj: str = Field(..., min_length=14, max_length=18)
    description: str = Field(..., min_length=10, max_length=1000)
    address: str = Field(..., min_length=5, max_length=300)
    website: Optional[str] = None
    verified: bool = Field(default=False)
    rating: float = Field(default=0.0, ge=0, le=5)
    total_properties: int = Field(default=0, ge=0)
    properties: List[str] = Field(default=[])

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "Maria Santos",
                "email": "maria@imobiliaria.com",
                "phone": "(11) 88888-8888",
                "user_type": "anunciante",
                "company_name": "Imobiliária Santos",
                "cnpj": "12.345.678/0001-90",
                "description": "Imobiliária especializada em moradia estudantil",
                "address": "Rua Comercial, 456",
                "website": "https://imobiliariasantos.com",
                "verified": True,
                "rating": 4.8,
                "total_properties": 15
            }
        }


class UserCreate(BaseModel):
    #Modelo para criação de usuário
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    password: str = Field(..., min_length=6, max_length=100)
    userType: Optional[Literal["student", "advertiser"]] = None  # Para compatibilidade com frontend
    user_type: Optional[Literal["student", "advertiser"]] = None
    
    # Campos específicos do estudante
    university: Optional[str] = Field(None, min_length=1, max_length=200)
    course: Optional[str] = Field(None, min_length=1, max_length=100)
    semester: Optional[str] = Field(None, min_length=1, max_length=20)
    
    # Campos específicos do anunciante
    companyName: Optional[str] = Field(None, min_length=1, max_length=200)  # Para compatibilidade
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    cnpj: Optional[str] = Field(None, min_length=14, max_length=18)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    website: Optional[str] = None
    
    def get_user_type(self):
        #Retorna o tipo de usuário, priorizando userType se existir
        return self.userType or self.user_type
    
    def get_company_name(self):
        #Retorna o nome da empresa, priorizando companyName se existir
        return self.companyName or self.company_name


class ProfileUpdateRequest(BaseModel):
    #Modelo para atualização de perfil
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    profile_image: Optional[str] = None
    
    # Campos específicos do estudante
    university: Optional[str] = Field(None, min_length=1, max_length=200)
    course: Optional[str] = Field(None, min_length=1, max_length=100)
    semester: Optional[str] = Field(None, min_length=1, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)
    preferences: Optional[StudentPreferences] = None
    
    # Campos específicos do anunciante
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    cnpj: Optional[str] = Field(None, min_length=14, max_length=18)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    website: Optional[str] = None


class LoginRequest(BaseModel):
    #Modelo para login
    email: EmailStr
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    #Resposta do login
    access_token: str
    token_type: str = "bearer"
    user: Union[StudentProfile, AdvertiserProfile]


class ApiResponse(BaseModel):
    #Resposta padrão da API
    success: bool
    message: Optional[str] = None
    data: Optional[dict] = None
    errors: Optional[dict] = None