from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, date

    #Modelo para criar uma reserva
class ReservationCreate(BaseModel):
    property_id: str = Field(..., description="ID da propriedade")
    start_date: date = Field(..., description="Data de início da reserva")
    end_date: date = Field(..., description="Data de fim da reserva")
    guests: int = Field(..., gt=0, description="Número de pessoas")
    message: Optional[str] = Field(None, max_length=500, description="Mensagem adicional")
    total_price: float = Field(..., gt=0, description="Preço total da reserva")

    #Modelo para atualizar uma reserva
class ReservationUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    guests: Optional[int] = Field(None, gt=0)
    message: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, pattern="^(pending|confirmed|cancelled|rejected)$")

    #Resposta completa de uma reserva
class ReservationResponse(BaseModel):
    id: str
    property_id: str
    student_id: str
    advertiser_id: str
    start_date: date
    end_date: date
    guests: int
    message: Optional[str] = None
    total_price: float
    status: str  # 'pending', 'confirmed', 'cancelled', 'rejected'
    created_at: datetime
    updated_at: datetime

    # Informações da propriedade
    property_title: Optional[str] = None
    property_type: Optional[str] = None
    property_location: Optional[str] = None
    property_images: Optional[list] = []

    # Informações do estudante
    student_name: Optional[str] = None
    student_email: Optional[str] = None

    # Informações do anunciante
    advertiser_name: Optional[str] = None
    advertiser_email: Optional[str] = None

    #Modelo para demonstrar interesse em uma propriedade (mantido para compatibilidade)
class RentalInterest(BaseModel):
    property_id: str
    message: Optional[str] = None

    #Resposta para demonstração de interesse (mantido para compatibilidade)
class RentalInterestResponse(BaseModel):
    id: str
    property_id: str
    student_id: str
    advertiser_id: str
    message: Optional[str] = None
    status: str  # 'pending', 'accepted', 'rejected'
    created_at: datetime
    updated_at: datetime

    #Modelo para solicitação de aluguel (mantido para compatibilidade)
class RentalRequest(BaseModel):
    property_id: str
    start_date: str
    end_date: str
    message: Optional[str] = None

   #Resposta para solicitação de aluguel (mantido para compatibilidade)
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

    #Modelo de resposta da API
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

# Novos modelos para sistema de chat

    #Modelo para criar uma nova conversa/chat
class ChatCreate(BaseModel):
    property_id: str = Field(..., description="ID da propriedade que originou o chat")
    initial_message: str = Field(..., max_length=500, description="Mensagem inicial do chat")

    #Modelo para enviar uma mensagem no chat
class MessageCreate(BaseModel):
    chat_id: str = Field(..., description="ID do chat")
    content: str = Field(..., max_length=500, description="Conteúdo da mensagem")

    #Resposta de uma mensagem individual
class MessageResponse(BaseModel):
    id: str
    chat_id: str
    sender_id: str
    sender_name: Optional[str] = None
    sender_type: str  # 'student' ou 'advertiser'
    content: str
    created_at: datetime
    is_read: bool = False

    #Resposta de um chat completo
class ChatResponse(BaseModel):
    id: str
    property_id: str
    student_id: str
    advertiser_id: str
    status: str  # 'active', 'closed'
    created_at: datetime
    updated_at: datetime

    # Informações da propriedade
    property_title: Optional[str] = None
    property_images: Optional[list] = []
    property_price: Optional[float] = None

    # Informações dos participantes
    student_name: Optional[str] = None
    advertiser_name: Optional[str] = None

    # Última mensagem
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0

    #Lista de chats
class ChatListResponse(BaseModel):
    chats: list[ChatResponse]
    total: int

    #Histórico de mensagens de um chat
class ChatMessagesResponse(BaseModel):
    chat_id: str
    messages: list[MessageResponse]
    total: int