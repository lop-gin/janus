from datetime import datetime
from typing import List, Optional # Corrected from list to List
from pydantic import BaseModel, EmailStr

class ActivityLogEntryResponse(BaseModel):
    id: int
    company_id: int
    user_id: int # This is public.users.id
    user_email: Optional[EmailStr] = None
    user_name: Optional[str] = None
    activity_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    description: str
    created_at: datetime

    class Config:
        orm_mode = True # For SQLAlchemy or ORM-like objects
        # In Pydantic V2, orm_mode is replaced by from_attributes = True
        # from_attributes = True # Uncomment if using Pydantic V2 and it's needed

class PaginatedActivityLogResponse(BaseModel):
    items: List[ActivityLogEntryResponse] # Corrected from list to List
    total: int
    page: int
    per_page: int
    pages: int # Total number of pages
    # next_page: Optional[int] = None # Optional: if you want to include next/prev page numbers
    # prev_page: Optional[int] = None # Optional: if you want to include next/prev page numbers
