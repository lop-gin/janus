from fastapi import Depends
from supabase import create_client, Client
import os

def get_supabase() -> Client:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    if not supabase_url or not supabase_key:
        raise Exception("Supabase URL or key not configured")
    return create_client(supabase_url, supabase_key)