from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class CustomerModel(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    company: str
    status: str = "Active"
    createdAt: str
    avatar: str

class CustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = "Active"
    avatar: Optional[str] = None
    id: Optional[str] = None
    createdAt: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None
    avatar: Optional[str] = None

class StatsResponse(BaseModel):
    total: int
    active: int
    inactive: int
    activePercentage: int
    churnRate: int
    newThisMonth: int

class ChatMessageModel(BaseModel):
    id: Optional[str] = None
    sender: str
    text: str
    toolCalled: Optional[str] = None
    badge: Optional[str] = None
    timestamp: Optional[str] = None

class CopilotChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, Any]]] = None

class CopilotChatResponse(BaseModel):
    text: str
    toolCalled: Optional[str] = None
    badge: Optional[str] = None
    data: Optional[Any] = None

