from fastapi import APIRouter, Depends, HTTPException, status
from models.products import Product, ProductCreate
from dependencies.auth import get_current_user
from utils.supabase import get_supabase
from utils.helpers import convert_dates_to_strings
from supabase import Client

router = APIRouter()

@router.get("/", response_model=list[Product])
async def get_products(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Retrieve all products for the user's company."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    response = supabase.table("products").select("*").eq("company_id", company_id).execute()
    return response.data or []

@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new product."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    product_data = product.dict()
    product_data["company_id"] = company_id
    product_data["created_by"] = user_id
    product_data["updated_by"] = user_id
    product_data = convert_dates_to_strings(product_data)

    response = supabase.table("products").insert(product_data).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=400, detail="Failed to create product")