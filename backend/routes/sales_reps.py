from fastapi import APIRouter, Depends, HTTPException, status
from models.users import User
from dependencies.auth import get_current_user
from utils.supabase import get_supabase
from supabase import Client

router = APIRouter()

@router.get("/", response_model=list[User])
async def get_sales_reps(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Retrieve users with sales-related roles for the user's company."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    roles_response = supabase.table("roles").select("id").eq("company_id", company_id).in_("role_name", ["Super Admin", "Admin", "Sales Supervisor", "Sales Rep"]).execute()
    role_ids = [role["id"] for role in roles_response.data]
    user_roles_response = supabase.table("user_roles").select("user_id").in_("role_id", role_ids).execute()
    user_ids = [ur["user_id"] for ur in user_roles_response.data]
    users_response = supabase.table("users").select("id, company_id, name, email").in_("id", user_ids).execute()
    return users_response.data or []