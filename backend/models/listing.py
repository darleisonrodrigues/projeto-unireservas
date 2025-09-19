"""
Modelos para listings/anúncios
Baseado em src/types/listing.ts
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class Amenity(BaseModel):
    #Modelo para comodidades
    id: str
    label: str
    value: str


class ListingFormData(BaseModel):
    """Dados do formulário de criação de anúncio"""
    title: str = Field(..., min_length=1, max_length=200)
    type: Literal["kitnet", "quarto", "apartamento"]
    price: float = Field(..., gt=0)
    description: str = Field(..., min_length=10, max_length=2000)
    address: str = Field(..., min_length=5, max_length=300)
    neighborhood: str = Field(..., min_length=1, max_length=100)
    university: str = Field(..., min_length=1, max_length=200)
    distance: str = Field(..., min_length=1, max_length=50)
    capacity: int = Field(..., gt=0)
    amenities: List[str] = Field(default=[])
    # photos será tratado separadamente no upload

    #Modelo para criação de listing
class ListingCreate(ListingFormData):
    pass

 #Modelo para atualização de listing
class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[Literal["kitnet", "quarto", "apartamento"]] = None
    price: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    neighborhood: Optional[str] = Field(None, min_length=1, max_length=100)
    university: Optional[str] = Field(None, min_length=1, max_length=200)
    distance: Optional[str] = Field(None, min_length=1, max_length=50)
    capacity: Optional[int] = Field(None, gt=0)
    amenities: Optional[List[str]] = None

    #Modelo completo de listing
class Listing(BaseModel):
    id: Optional[str] = None
    title: str
    type: Literal["kitnet", "quarto", "apartamento"]
    price: float
    description: str
    address: str
    neighborhood: str
    university: str
    distance: str
    capacity: int
    amenities: List[str] = Field(default=[])
    photos: List[str] = Field(default=[])  # URLs das fotos
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    user_id: Optional[str] = None
    is_active: bool = Field(default=True)
    views: int = Field(default=0)
    rating: float = Field(default=0.0, ge=0, le=5)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "title": "Quarto confortável próximo à USP",
                "type": "quarto",
                "price": 600.0,
                "description": "Quarto amplo em república próxima à universidade. Ambiente estudantil e seguro.",
                "address": "Rua das Flores, 123",
                "neighborhood": "Vila Madalena",
                "university": "USP",
                "distance": "300m",
                "capacity": 1,
                "amenities": ["wifi", "mobiliado", "lavanderia"],
                "photos": ["https://example.com/photo1.jpg"],
                "is_active": True,
                "views": 0,
                "rating": 0.0
            }
        }

    #Resposta com listing
class ListingResponse(Listing):
    pass

    #Resposta com lista de listings
class ListingsListResponse(BaseModel):
    listings: List[Listing]
    total: int
    page: int
    per_page: int
    total_pages: int

    #Resposta do upload de foto"""
class PhotoUploadResponse(BaseModel):
    url: str
    filename: str