from pydantic import BaseModel
from typing import Optional
from .common import Address

class Customer(BaseModel):
    """Model for customer response."""
    id: int
    company_id: int
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    billing_address: Address
    initial_balance: Optional[float] = 0

class CustomerCreate(BaseModel):
    """Model for creating a new customer."""
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    billing_address: Address
    initial_balance: Optional[float] = 0