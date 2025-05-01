from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List

class User(BaseModel):
    """Model for user response."""
    id: int
    company_id: int
    name: str
    email: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: str
    roles: List[str] = []

class UserInvite(BaseModel):
    """Model for inviting a new user."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    gender: Optional[str] = None
    roles: List[str] = []  # Optional role names to assign on invite

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

class UserUpdate(BaseModel):
    """Model for updating user details."""
    name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    is_active: Optional[bool] = None

class UserRoleAssignment(BaseModel):
    """Model for assigning roles to a user."""
    user_id: int
    role_ids: List[int]