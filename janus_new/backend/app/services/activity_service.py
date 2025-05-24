from uuid import UUID
from app.core.supabase_client import get_supabase_admin_client
# from sqlalchemy.orm import Session # If we were using SQLAlchemy

async def get_user_details_for_logging(auth_user_id: UUID) -> tuple[int | None, int | None]:
    """
    Retrieves the public.users.id and company_id for a given auth.users.id (UUID).
    Returns (public_user_id, company_id) or (None, None) if not found.
    """
    if not auth_user_id:
        return None, None
        
    try:
        supabase_client = get_supabase_admin_client()
        # Assuming 'auth_user_id' is the column name in public.users that stores the UUID from auth.users
        response = supabase_client.table("users").select(
            "id, company_id" # Select public.users.id and company_id
        ).eq(
            "auth_user_id", str(auth_user_id) # Ensure UUID is passed as string
        ).single().execute()

        if response.data:
            return response.data.get("id"), response.data.get("company_id")
        else:
            # This case means no matching user in public.users table, which could be an issue.
            print(f"No public.users record found for auth_user_id: {auth_user_id}") # Log this
            return None, None
    except Exception as e:
        print(f"Error fetching user details for logging: {e}") # Replace with actual logging
        return None, None

async def record_activity(
    # db: Session, # If using SQLAlchemy
    company_id: int,
    user_id: int, # This is the ID from your public.users table
    activity_type: str,
    description: str,
    entity_type: str | None = None, # Corrected type hint
    entity_id: int | None = None,   # Corrected type hint
):
    if company_id is None or user_id is None:
        print(f"Skipping activity recording: company_id or user_id is None for activity: {activity_type}")
        return

    try:
        supabase_client = get_supabase_admin_client()
        
        log_entry = {
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": activity_type,
            "description": description,
        }
        if entity_type:
            log_entry["entity_type"] = entity_type
        if entity_id:
            log_entry["entity_id"] = entity_id
        
        response = supabase_client.table("activity_log").insert(log_entry).execute()

        # Supabase insert via `execute()` usually returns a Response object.
        # Successful inserts might have data (the inserted rows) or just be successful without specific data.
        # Need to check how `postgrest-py` structures this. Often, if `count` is part of the response, it's useful.
        # For now, checking if response.data exists and is not empty (if it's a list)
        # or just that no error was thrown by Postgrest.
        
        # A more robust check might be needed based on actual Supabase client behavior for inserts.
        # If `response.data` is empty on success, this logic needs adjustment.
        # Typically, if an error occurs, it raises an exception which is caught below.
        # So, if no exception, we can assume success.
        # print(f"Activity recorded: {description}") # Or use proper logging

        # Let's refine based on typical supabase-py behavior:
        # If an error occurs (like RLS violation, constraint violation), it should raise an ApiError.
        # If it doesn't raise, the insert was likely accepted by PostgREST.
        # The `response.data` for an INSERT usually contains the inserted records.
        if response.data and len(response.data) > 0:
            print(f"Activity recorded: {description} (Data: {response.data[0].get('id')})") # Log with ID
        else:
            # This path might be hit if RLS prevents returning data but allows insert,
            # or if preference is "return=minimal".
            # Consider if this is truly an error or just a silent success.
            # For critical logging, ensuring data is returned (e.g. via `select()`) might be better.
            # But for a simple log, if no exception, it's usually fine.
            # print(f"Activity recorded (no data in response): {description}")
            # Let's assume for now that if no exception, it's logged.
            # If there's an error attribute in response, it's more explicit.
            if hasattr(response, 'error') and response.error:
                 print(f"Failed to record activity (error in response): {description}. Error: {response.error}")
            elif not response.data: # If no error attribute but also no data.
                 print(f"Activity recorded (no data in response, but no explicit error): {description}")
            else: # Should not happen if previous conditions are met
                 print(f"Activity recorded: {description}")


    except Exception as e:
        print(f"Error recording activity: {e}") # Replace with actual logging
        # Consider re-raising or handling more gracefully if this is critical path
        # For activity logging, often it's best-effort and shouldn't break main functionality.
