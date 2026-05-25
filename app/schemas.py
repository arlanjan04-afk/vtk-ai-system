from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ===== АВТОРИЗАЦИЯ =====
class UserRegister(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    role: str = "student"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== ЗАЯВКИ =====
class RequestBase(BaseModel):
    description: Optional[str] = ""
    service_type: Optional[str] = ""
    title: Optional[str] = ""
    category: Optional[str] = ""


class RequestCreate(RequestBase):
    pass


class RequestResponse(BaseModel):
    id: int
    user_id: Optional[int]
    description: str
    service_type: str
    priority: str
    priority_score: int
    sentiment: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ===== ЧАТ =====
class ChatMessageCreate(BaseModel):
    message: str


class ChatHistoryResponse(BaseModel):
    id: int
    user_id: Optional[int]
    message: str
    response: str
    category: str
    confidence: float
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== УСЛУГИ =====
class ServiceBase(BaseModel):
    name: str
    category: str
    description: str
    department: str
    processing_time: str


class ServiceCreate(ServiceBase):
    pass


class ServiceResponse(ServiceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class RecommendationQuery(BaseModel):
    query: Optional[str] = ""
    user_role: Optional[str] = "student"
