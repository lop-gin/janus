import os
from supabase import create_client, Client
from .config import settings

def get_supabase_admin_client() -> Client:
    """
    Initializes and returns a Supabase client instance configured with the
    service role key for admin-level operations.
    """
    supabase_url = settings.SUPABASE_URL
    supabase_key = settings.SUPABASE_SERVICE_KEY
    
    if not supabase_url or not supabase_key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")
        
    return create_client(supabase_url, supabase_key)

# Optional: A function to get a client based on user's JWT (for user-specific actions)
# This would be used if we weren't using the admin client for password setting.
# def get_supabase_auth_client(jwt: str) -> Client:
#     supabase_url = settings.SUPABASE_URL
#     if not supabase_url:
#         raise ValueError("SUPABASE_URL must be set in .env file")
#     
#     # Note: Supabase client typically manages auth state internally after set_session or sign_in.
#     # If you need to initialize a client with a JWT directly for a specific call,
#     # the method might vary or you'd set a global header.
#     # For most post-auth calls, you'd use the same client instance on which sign_in or set_session was called.
#     # This function is more of a placeholder for that concept.
#     # For now, we will rely on the admin client for user updates as per the task.
#     
#     headers = {"Authorization": f"Bearer {jwt}"}
#     return create_client(supabase_url, settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_KEY, options={"headers": headers}) # ANON_KEY if it's for user context
#
# settings.SUPABASE_ANON_KEY would need to be added to config if this approach was used.
# For now, get_supabase_admin_client is the primary client we'll use.
