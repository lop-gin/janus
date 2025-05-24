from typing import Optional
from pydantic import BaseModel

class PublicConfigResponse(BaseModel):
    supabase_url: str
    supabase_anon_key: str
    site_name: Optional[str] = "Recordserp"
    version: Optional[str] = "0.1.0" # Example version
