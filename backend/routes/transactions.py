from fastapi import APIRouter, Depends, HTTPException, status
from models.transactions import Transaction, TransactionCreate
from dependencies.auth import get_current_user
from utils.supabase import get_supabase
from utils.helpers import convert_dates_to_strings
from supabase import Client

router = APIRouter()

@router.post("/invoices", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice: TransactionCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new invoice with associated items."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    invoice_data = invoice.dict(exclude={"items"})
    invoice_data = convert_dates_to_strings(invoice_data)
    invoice_data["company_id"] = company_id
    invoice_data["created_by"] = user_id
    invoice_data["updated_by"] = user_id

    transaction_response = supabase.table("transactions").insert(invoice_data).execute()
    if not transaction_response.data:
        raise HTTPException(status_code=400, detail="Failed to create invoice")
    transaction_id = transaction_response.data[0]["id"]

    for item in invoice.items:
        item_data = item.dict()
        item_data = convert_dates_to_strings(item_data)
        item_data["transaction_id"] = transaction_id
        item_data["created_by"] = user_id
        item_data["updated_by"] = user_id
        supabase.table("transaction_items").insert(item_data).execute()

    full_transaction_data = supabase.table("transactions").select("*").eq("id", transaction_id).execute().data[0]
    items_data = supabase.table("transaction_items").select("*").eq("transaction_id", transaction_id).execute().data
    full_transaction_data["items"] = items_data

    return Transaction(**full_transaction_data)

@router.post("/sales-receipts", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def create_sales_receipt(
    sales_receipt: TransactionCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new sales receipt with associated items."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    if sales_receipt.transaction_type != "sales_receipt":
        raise HTTPException(status_code=400, detail="Invalid transaction type for sales receipt")

    sales_receipt_data = sales_receipt.dict(exclude={"items"})
    sales_receipt_data = convert_dates_to_strings(sales_receipt_data)
    sales_receipt_data["company_id"] = company_id
    sales_receipt_data["created_by"] = user_id
    sales_receipt_data["updated_by"] = user_id

    transaction_response = supabase.table("transactions").insert(sales_receipt_data).execute()
    if not transaction_response.data:
        raise HTTPException(status_code=400, detail="Failed to create sales receipt")
    transaction_id = transaction_response.data[0]["id"]

    for item in sales_receipt.items:
        item_data = item.dict()
        item_data = convert_dates_to_strings(item_data)
        item_data["transaction_id"] = transaction_id
        item_data["created_by"] = user_id
        item_data["updated_by"] = user_id
        supabase.table("transaction_items").insert(item_data).execute()

    full_transaction_data = supabase.table("transactions").select("*").eq("id", transaction_id).execute().data[0]
    items_data = supabase.table("transaction_items").select("*").eq("transaction_id", transaction_id).execute().data
    full_transaction_data["items"] = items_data

    return Transaction(**full_transaction_data)