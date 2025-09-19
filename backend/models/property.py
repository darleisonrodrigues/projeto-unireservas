"""
Modelos para propriedades
Baseado em src/types/property.ts
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class PropertyType(str):
    #Tipos de propriedade disponíveis
    KITNET = "kitnet"
    QUARTO = "quarto"
    APARTAMENTO = "apartamento"


class Property(BaseModel):
    #Modelo de propriedade
    id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    type: Literal["kitnet", "quarto", "apartamento"]
    price: float = Field(..., gt=0)
    location: str = Field(..., min_length=1, max_length=200)
    university: str = Field(..., min_length=1, max_length=200)
    distance: str = Field(..., min_length=1, max_length=50)
    image: str = Field(..., min_length=1)
    rating: float = Field(default=0.0, ge=0, le=5)
    amenities: List[str] = Field(default=[])
    capacity: int = Field(..., gt=0)
    is_favorited: bool = Field(default=False)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    owner_id: Optional[str] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "Apartamento próximo à UFMG",
                "type": "apartamento",
                "price": 800.0,
                "location": "Pampulha, Belo Horizonte",
                "university": "UFMG",
                "distance": "500m",
                "image": "https://example.com/image.jpg",
                "rating": 4.5,
                "amenities": ["wifi", "ar-condicionado", "mobiliado"],
                "capacity": 2,
                "is_favorited": False
            }
        }


class PropertyCreate(BaseModel):
    #Modelo para criação de propriedade
    title: str = Field(..., min_length=1, max_length=200)
    type: Literal["kitnet", "quarto", "apartamento"]
    price: float = Field(..., gt=0)
    location: str = Field(..., min_length=1, max_length=200)
    university: str = Field(..., min_length=1, max_length=200)
    distance: str = Field(..., min_length=1, max_length=50)
    image: str = Field(..., min_length=1)
    amenities: List[str] = Field(default=[])
    capacity: int = Field(..., gt=0)


class PropertyUpdate(BaseModel):
    #Modelo para atualização de propriedade
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[Literal["kitnet", "quarto", "apartamento"]] = None
    price: Optional[float] = Field(None, gt=0)
    location: Optional[str] = Field(None, min_length=1, max_length=200)
    university: Optional[str] = Field(None, min_length=1, max_length=200)
    distance: Optional[str] = Field(None, min_length=1, max_length=50)
    image: Optional[str] = Field(None, min_length=1)
    amenities: Optional[List[str]] = None
    capacity: Optional[int] = Field(None, gt=0)


class FilterState(BaseModel):
    #Modelo para filtros de busca
    property_type: Optional[str] = None
    price_range: Optional[str] = None
    max_price: Optional[float] = Field(None, gt=0)
    location: Optional[str] = None
    sort_by: Optional[Literal["relevancia", "menor-preco", "maior-preco", "mais-recente", "melhor-avaliado"]] = "relevancia"
    search_term: Optional[str] = None
    amenities: List[str] = Field(default=[])


class PropertyResponse(Property):
    #Resposta com propriedade
    pass


class PropertiesListResponse(BaseModel):
    #Resposta com lista de propriedades
    properties: List[Property]
    total: int
    page: int
    per_page: int
    total_pages: int