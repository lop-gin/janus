from datetime import datetime
from typing import Dict, List, Optional # Corrected imports
from pydantic import BaseModel, constr, validator

# Helper for permissions structure
PermissionSchema = Dict[str, List[str]]

class RoleBase(BaseModel):
    role_name: constr(min_length=1, max_length=100)
    description: Optional[str] = None
    permissions: PermissionSchema

    @validator('permissions')
    def validate_permissions(cls, v):
        if not v: # Permissions cannot be empty
            raise ValueError("Permissions cannot be empty.")
        # Example validation: ensure known modules and actions
        # known_modules = {"user_management", "role_management", "activity_log", "product_management", "order_management"}
        # known_actions = {"create", "read", "update", "delete", "manage"} # "manage" as a wildcard
        # for module, actions in v.items():
        #     if module not in known_modules:
        #         raise ValueError(f"Unknown module: {module}")
        #     if not isinstance(actions, list):
        #         raise ValueError(f"Actions for module {module} must be a list.")
        #     for action in actions:
        #         if action not in known_actions:
        #             raise ValueError(f"Unknown action '{action}' in module '{module}'")
        return v

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel): # Using BaseModel for partial updates
    role_name: Optional[constr(min_length=1, max_length=100)] = None
    description: Optional[str] = None
    permissions: Optional[PermissionSchema] = None

    @validator('permissions')
    def validate_optional_permissions(cls, v):
        if v is not None and not v: # If permissions are provided, they cannot be empty
             raise ValueError("Permissions, if provided, cannot be empty.")
        # Add similar module/action validation as in RoleBase if needed
        return v


class RoleResponse(RoleBase):
    id: int
    company_id: int
    is_system_role: bool = False # Default to False, can be overridden by DB value
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True # For Pydantic V1
        # from_attributes = True # For Pydantic V2, if needed based on project's Pydantic version
