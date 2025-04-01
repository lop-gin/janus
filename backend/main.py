from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from supabase import create_client, Client
import jwt
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust if your frontend URL differs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration (replace with your credentials)
SUPABASE_URL = "http://127.0.0.1:54321"  # Get from Supabase dashboard
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"  # Get from Supabase dashboard
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# JWT configuration
SECRET_KEY = "d905fe1c3e9396590bcbdd6e21b95b7f19ac87f6d733074ed7b82ebc14eb41ff"  # Replace with a secure key
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models matching your database schema
class Address(BaseModel):
    street: str
    city: str
    state: str
    zipCode: str
    country: str

from typing import Optional

class Customer(BaseModel):
    id: int
    company_id: int
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    billing_address: Address  # Already defined as a Pydantic model
    initial_balance: Optional[float] = 0

class CustomerCreate(BaseModel):
    name: str
    company: Optional[str] = None
    email: Optional[str] = None
    billing_address: Address
    initial_balance: Optional[float] = 0

class Product(BaseModel):
    id: Optional[int] = None
    company_id: int
    category_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    default_unit_price: Optional[float] = None
    primary_unit_of_measure: str
    secondary_unit_of_measure: Optional[str] = None
    conversion_factor: Optional[float] = None
    default_tax_percent: Optional[float] = None

class TransactionItem(BaseModel):
    id: Optional[int] = None
    transaction_id: int
    product_id: Optional[int] = None
    description: Optional[str] = None
    quantity: float
    unit_of_measure: str
    unit_price: float
    tax_percent: float
    amount: float

class Transaction(BaseModel):
    id: Optional[int] = None
    company_id: int
    transaction_number: str
    transaction_type: str
    customer_id: int
    sales_rep_id: Optional[int] = None
    transaction_date: date
    due_date: Optional[date] = None
    expiration_date: Optional[date] = None
    terms: Optional[str] = None
    status: str
    message: Optional[str] = None
    net_total: float
    tax_total: float
    other_fees: float
    gross_total: float
    parent_transaction_id: Optional[int] = None
    deleted_at: Optional[date] = None
    items: List[TransactionItem]

class User(BaseModel):
    id: int
    company_id: int
    name: str
    email: str

# Authentication dependency
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        user = supabase.auth.get_user(token)
        return user.user.id  # Returns the user ID if valid
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Basic endpoint to test
@app.get("/")
async def root():
    return {"message": "Hello World"}

# Customer Endpoints
@app.get("/customers", response_model=List[Customer])
async def get_customers(current_user: str = Depends(get_current_user)):
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    response = supabase.table("customers").select("*").eq("company_id", company_id).execute()
    if response.data:
        customers = []
        for cust in response.data:
            # Parse billing_address from JSON string to dict
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

@app.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, current_user: str = Depends(get_current_user)):
    # Fetch both company_id and id from users table
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]  # Get the user's ID from the users table
    
    customer_data = customer.dict()
    customer_data["company_id"] = company_id
    customer_data["created_by"] = user_id  # Set created_by
    customer_data["updated_by"] = user_id  # Set updated_by
    # Convert billing_address dictionary to JSON string for TEXT field
    customer_data["billing_address"] = json.dumps(customer_data["billing_address"])
    
    response = supabase.table("customers").insert(customer_data).execute()
    if response.data:
        # Convert billing_address back to dict for the response
        created_customer = response.data[0]
        created_customer["billing_address"] = json.loads(created_customer["billing_address"])
        return created_customer
    raise HTTPException(status_code=400, detail="Failed to create customer")

# Product Endpoints
@app.get("/products", response_model=List[Product])
async def get_products(current_user: str = Depends(get_current_user)):
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    response = supabase.table("products").select("*").eq("company_id", company_id).execute()
    if response.data:
        return response.data
    raise HTTPException(status_code=404, detail="No products found")

@app.post("/products", response_model=Product)
async def create_product(product: Product, current_user: str = Depends(get_current_user)):
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]
    product_data = product.dict()
    product_data["company_id"] = company_id
    product_data["created_by"] = user_id
    product_data["updated_by"] = user_id
    response = supabase.table("products").insert(product_data).execute()
    if response.data:
        return response.data[0]
    raise HTTPException(status_code=400, detail="Failed to create product")

# Sales Reps Endpoint
@app.get("/sales-reps", response_model=List[User])
async def get_sales_reps(current_user: str = Depends(get_current_user)):
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    roles_response = supabase.table("roles").select("id").eq("company_id", company_id).in_("role_name", ["Super Admin", "Admin", "Sales Supervisor", "Sales Rep"]).execute()
    role_ids = [role["id"] for role in roles_response.data]
    user_roles_response = supabase.table("user_roles").select("user_id").in_("role_id", role_ids).execute()
    user_ids = [ur["user_id"] for ur in user_roles_response.data]
    users_response = supabase.table("users").select("id, company_id, name, email").in_("id", user_ids).execute()
    if users_response.data:
        return users_response.data
    raise HTTPException(status_code=404, detail="No sales reps found")

# Invoice Endpoint
@app.post("/invoices", response_model=Transaction)
async def create_invoice(invoice: Transaction, current_user: str = Depends(get_current_user)):
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]
    invoice.company_id = company_id
    invoice_data = invoice.dict(exclude={"items"})
    invoice_data["created_by"] = user_id
    invoice_data["updated_by"] = user_id
    transaction_response = supabase.table("transactions").insert(invoice_data).execute()
    if not transaction_response.data:
        raise HTTPException(status_code=400, detail="Failed to create invoice")
    transaction_id = transaction_response.data[0]["id"]
    for item in invoice.items:
        item.transaction_id = transaction_id
        item_data = item.dict()
        item_data["created_by"] = user_id
        item_data["updated_by"] = user_id
        supabase.table("transaction_items").insert(item_data).execute()
    return transaction_response.data[0]