from pydantic import BaseModel, validator
from typing import Optional
from datetime import date

class Product(BaseModel):
    """Model for product response."""
    id: Optional[int] = None
    company_id: int
    category_id: Optional[int] = None
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    primary_unit_of_measure: str
    secondary_unit_of_measure: Optional[str] = None
    conversion_factor: Optional[float] = None
    default_tax_percent: Optional[float] = None
    initial_quantity: Optional[float] = 0
    as_of_date: Optional[str] = None
    reorder_point: Optional[float] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None

class ProductCreate(BaseModel):
    """Model for creating a new product."""
    category_id: Optional[int] = None
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    primary_unit_of_measure: str
    secondary_unit_of_measure: Optional[str] = None
    conversion_factor: Optional[float] = None
    default_tax_percent: Optional[float] = None
    initial_quantity: Optional[float] = 0
    as_of_date: Optional[date] = None
    reorder_point: Optional[float] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()