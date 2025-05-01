from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from utils.supabase import get_supabase
from supabase import Client
import os
import jwt

SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), supabase: Client = Depends(get_supabase)):
    """Authenticate user using Supabase JWT token."""
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

def check_permission(module: str, action: str):
    async def permission_checker(current_user: str = Depends(get_current_user), supabase: Client = Depends(get_supabase)):
        """Check if user has the required permission for a module and action."""
        user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
        if not user_response.data:
            raise HTTPException(status_code=404, detail="User not found")
        user = user_response.data[0]
        user_id = user["id"]

        roles_response = supabase.table("user_roles").select("roles!inner(permissions)").eq("user_id", user_id).execute()
        if not roles_response.data:
            raise HTTPException(status_code=403, detail="No roles assigned")

        has_permission = False
        for role in roles_response.data:
            permissions = role["roles"]["permissions"] or {}
            if permissions.get("all_modules", False):
                has_permission = True
                break
            module_perms = permissions.get(module, {})
            if module == "employee":
                specific_perms = module_perms.get(f"{module}_{action}", [])
                if action in specific_perms:
                    has_permission = True
                    break
            else:
                if action in module_perms:
                    has_permission = True
                    break

        if not has_permission:
            raise HTTPException(status_code=403, detail=f"Missing {module}:{action} permission")
        return user
    return permission_checker