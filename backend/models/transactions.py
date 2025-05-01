from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class TransactionItem(BaseModel):
    """Model for transaction item response."""
    id: Optional[int] = None
    transaction_id: int
    product_id: Optional[int] = None
    description: Optional[str] = None
    quantity: float
    unit_of_measure: str
    unit_price: float
    tax_percent: float
    amount: float

class TransactionItemCreate(BaseModel):
    """Model for creating a transaction item."""
    product_id: Optional[int] = None
    description: Optional[str] = None
    quantity: float
    unit_of_measure: str
    unit_price: float
    tax_percent: float
    amount: float

class Transaction(BaseModel):
    """Model for transaction response."""
    id: Optional[int] = None
    company_id: int
    transaction_number: str
    transaction_type: str
    customer_id: int
    sales_rep_id: Optional[int] = None
    transaction_date: str
    due_date: Optional[str] = None
    expiration_date: Optional[str] = None
    terms: Optional[str] = None
    status: str
    message: Optional[str] = None
    net_total: float
    tax_total: float
    other_fees: float
    gross_total: float
    parent_transaction_id: Optional[int] = None
    deleted_at: Optional[str] = None
    items: List[TransactionItem]

class TransactionCreate(BaseModel):
    """Model for creating a transaction."""
    transaction_number: str
    transaction_type: str
    customer_id: int
    sales_rep_id: Optional[int] = None
    transaction_date: date
    due_date: Optional[date] = None
    expiration_date: Optional[date] = None
    terms: Optional[str] = None
    status: str
    message: Optional[str] = None
    net_total: float
    tax_total: float
    other_fees: float
    gross_total: float
    parent_transaction_id: Optional[int] = None
    deleted_at: Optional[date] = None
    items: List[TransactionItemCreate]