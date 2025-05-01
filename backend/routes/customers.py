from fastapi import APIRouter, Depends, HTTPException, status
from models.common import Address
from models.customers import Customer, CustomerCreate
from dependencies.auth import get_current_user
from utils.supabase import get_supabase
from supabase import Client
import json

router = APIRouter()

@router.get("/", response_model=list[Customer])
async def get_customers(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Retrieve all customers for the user's company."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    response = supabase.table("customers").select("*").eq("company_id", company_id).execute()
    if response.data:
        customers = []
        for cust in response.data:
            if isinstance(cust["billing_address"], str):
                try:
                    cust["billing_address"] = json.loads(cust["billing_address"])
                except json.JSONDecodeError:
                    cust["billing_address"] = {
                        "street": cust["billing_address"],
                        "city": "",
                        "state": "",
                        "zipCode": "",
                        "country": ""
                    }
            customers.append(cust)
        return customers
    raise HTTPException(status_code=404, detail="No customers found")

@router.post("/", response_model=Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer: CustomerCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new customer."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    customer_data = customer.dict()
    customer_data["company_id"] = company_id
    customer_data["created_by"] = user_id
    customer_data["updated_by"] = user_id
    customer_data["billing_address"] = json.dumps(customer_data["billing_address"])

    response = supabase.table("customers").insert(customer_data).execute()
    if response.data:
        created_customer = response.data[0]
        created_customer["billing_address"] = json.loads(created_customer["billing_address"])
        return created_customer
    raise HTTPException(status_code=400, detail="Failed to create customer")