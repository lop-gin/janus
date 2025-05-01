from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from routes import roles, customers, categories, products, sales_reps, transactions, users

app = FastAPI(title="Janus Manufacturing API", version="1.0.0")

# Load frontend URL from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(roles.router, prefix="/roles", tags=["Roles"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(sales_reps.router, prefix="/sales-reps", tags=["Sales Reps"])
app.include_router(transactions.router, tags=["Transactions"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Janus Manufacturing API is running"}