from fastapi import FastAPI

app = FastAPI(title="Recordserp API")

@app.get("/")
async def root():
    return {"message": "Welcome to Recordserp API"}

from app.routers import auth as auth_router
from app.routers import config_router as public_config_router
from app.routers import activity_router
from app.routers import role_router
from app.routers import user_router # Added

app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(public_config_router.router, prefix="/api/v1/config", tags=["Public Configuration"])
app.include_router(activity_router.router, prefix="/api/v1/activity-logs", tags=["Activity Logs"])
app.include_router(role_router.router, prefix="/api/v1/roles", tags=["Role Management"])
app.include_router(user_router.router, prefix="/api/v1/users", tags=["User Management"]) # Added
