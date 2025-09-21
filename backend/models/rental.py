from pydantic import BaseModel
from typing import Optional
from datetime import datetime

    #Modelo para demonstrar interesse em uma propriedade
class RentalInterest(BaseModel):
    property_id: str
    message: Optional[str] = None

    #Resposta para demonstração de interesse
class RentalInterestResponse(BaseModel):
    id: str
    property_id: str
    student_id: str
    advertiser_id: str
    message: Optional[str] = None
    status: str  # 'pending', 'accepted', 'rejected'
    created_at: datetime
    updated_at: datetime

    #Modelo para solicitação de aluguel
class RentalRequest(BaseModel):
    property_id: str
    start_date: str
    end_date: str
    message: Optional[str] = None

   #Resposta para solicitação de aluguel
class RentalRequestResponse(BaseModel):
    id: str
    property_id: str
    student_id: str
    advertiser_id: str
    start_date: str
    end_date: str
    message: Optional[str] = None
    status: str  # 'pending', 'approved', 'rejected', 'cancelled'
    created_at: datetime
    updated_at: datetime