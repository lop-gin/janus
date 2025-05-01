from pydantic import BaseModel, validator
from typing import Optional, Dict, Any

class RoleBase(BaseModel):
    """Base model for roles with validation."""
    role_name: str
    description: Optional[str] = None
    color: str
    permissions: Dict[str, Any] = {}

    @validator('role_name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Role name cannot be empty')
        if len(v) > 50:
            raise ValueError('Role name must be 50 characters or less')
        return v.strip()

    @validator('color')
    def color_must_be_valid(cls, v):
        valid_colors = [
            'blue', 'green', 'red', 'purple', 'teal', 'orange',
            'yellow', 'pink', 'cyan', 'gray', 'indigo', 'violet'
        ]
        if v not in valid_colors:
            raise ValueError(f'Color must be one of {valid_colors}')
        return v

class RoleCreate(RoleBase):
    """Model for creating a new role."""
    pass

class Role(RoleBase):
    """Model for role response with additional fields."""
    id: int
    company_id: int
    is_system_role: bool
    created_at: str
    updated_at: str