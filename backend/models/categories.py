from pydantic import BaseModel, validator
from typing import Optional

class Category(BaseModel):
    """Model for category response."""
    id: Optional[int] = None
    company_id: int
    name: str
    description: Optional[str] = None

class CategoryCreate(BaseModel):
    """Model for creating a new category."""
    name: str
    description: Optional[str] = None

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()