from fastapi import APIRouter, Depends
from app.core.config import Settings, settings as app_settings # Import the instance
from app.schemas.config_schemas import PublicConfigResponse

router = APIRouter()

# Dependency to get settings (optional, can also import directly)
# def get_settings() -> Settings:
#     return Settings()

@router.get("/public-config", response_model=PublicConfigResponse)
async def get_public_configuration(
    # settings: Settings = Depends(get_settings) # Using direct import for simplicity now
):
    # Access the globally instantiated settings from app.core.config
    return PublicConfigResponse(
        supabase_url=app_settings.SUPABASE_URL,
        supabase_anon_key=app_settings.SUPABASE_ANON_KEY,
        # site_name and version will use default values from Pydantic schema if not overridden
    )
