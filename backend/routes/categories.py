from fastapi import APIRouter, Depends, HTTPException, status
from models.categories import Category, CategoryCreate
from dependencies.auth import get_current_user
from utils.supabase import get_supabase
from supabase import Client

router = APIRouter()

@router.get("/", response_model=list[Category])
async def get_categories(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Retrieve all categories for the user's company."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    response = supabase.table("categories").select("*").eq("company_id", company_id).execute()
    return response.data or []

@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new category."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    category_data = category.dict()
    category_data["company_id"] = company_id
    category_data["created_by"] = user_id
    category_data["updated_by"] = user_id

    response = supabase.table("categories").insert(category_data).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=400, detail="Failed to create category")