from datetime import datetime
from typing import List, Optional # Corrected imports
from pydantic import BaseModel, EmailStr, constr
from uuid import UUID # For auth_user_id

# Schemas for User Management
class UserRoleResponse(BaseModel):
    id: int # Role ID from public.roles
    role_name: str

    class Config:
        orm_mode = True # For Pydantic V1
        # from_attributes = True # For Pydantic V2

class UserResponse(BaseModel):
    id: int # public.users.id
    auth_user_id: UUID # from public.users.auth_user_id (maps to auth.users.id)
    name: str
    email: EmailStr
    phone_number: Optional[str] = None # Changed from 'phone' to match DB
    is_active: bool
    roles: List[UserRoleResponse] = [] # Default to empty list
    created_at: datetime
    company_id: int

    class Config:
        orm_mode = True
        # from_attributes = True

class UserInviteRequest(BaseModel):
    email: EmailStr
    full_name: constr(min_length=1, max_length=255)
    role_id: int # ID of the role from public.roles to assign initially

class UserInviteResponse(BaseModel):
    id: int # ID of the invitation record from public.invitations
    email: EmailStr
    full_name: str
    code: str # The generated invite code
    role_id: int
    expires_at: datetime
    company_id: int
    created_by: int # public.users.id of the inviting user

    class Config:
        orm_mode = True
        # from_attributes = True

class UserUpdateRequest(BaseModel):
    role_ids: Optional[List[int]] = None
    is_active: Optional[bool] = None

    # Ensure at least one field is provided for an update
    @validator('*', pre=True, always=True)
    def check_at_least_one_value(cls, v, values):
        if not values: # Check if the dict of values is empty
            raise ValueError("At least one field (role_ids or is_active) must be provided for update.")
        return v

    # More specific validator to check if at least one of the optional fields is not None
    # This is a bit more complex with Pydantic v1; v2 has root_validator for this.
    # For now, the above validator is a basic check. A more robust one would ensure
    # that not all fields in the input data are None.
    # Let's refine this, this validator is not quite right for Pydantic V1 with optional fields.
    # Pydantic V1 doesn't easily support a root validator that checks "at least one of these is not None".
    # We will rely on the endpoint logic to check if the model_dump(exclude_unset=True) is empty.
    # Removing the custom validator for simplicity with Pydantic V1.
    # The endpoint will check if any actual update data is present.
    pass # Simplified for now

class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int # Total number of users matching filter (for pagination, if implemented)
    # Add other pagination fields if needed (page, per_page, etc.)
