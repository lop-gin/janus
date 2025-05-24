from fastapi import APIRouter, Depends, Query, HTTPException
from app.schemas.activity_schemas import PaginatedActivityLogResponse, ActivityLogEntryResponse
from app.core.supabase_client import get_supabase_admin_client
from app.dependencies.auth_deps import get_current_user_public_details, CurrentUserPublicDetails
from supabase import Client as SupabaseClient
import math

router = APIRouter()

@router.get("", response_model=PaginatedActivityLogResponse) # Changed path to be empty for router prefix
async def get_activity_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id_filter: int | None = Query(None, alias="userId"),
    activity_type_filter: str | None = Query(None, alias="activityType"),
    current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
    supabase: SupabaseClient = Depends(get_supabase_admin_client) # Added SupabaseClient dependency
):
    if not current_user or not current_user.company_id:
        raise HTTPException(status_code=403, detail="User company information not found.")

    # Calculate offset for pagination
    offset = (page - 1) * per_page

    try:
        # Base query for fetching logs
        query = supabase.table("activity_log").select(
            "*, users(email, name)", # Supabase direct join syntax
            count="exact" # Get total count for pagination
        ).eq(
            "company_id", current_user.company_id
        ).order(
            "created_at", desc=True
        ).range(
            offset, offset + per_page - 1
        ) # range is inclusive for Supabase, so offset to offset + limit - 1

        # Apply optional filters
        if user_id_filter is not None:
            query = query.eq("user_id", user_id_filter)
        if activity_type_filter:
            query = query.ilike("activity_type", f"%{activity_type_filter}%") # Case-insensitive search

        # Execute the query
        response = query.execute()

        if response.data is None: # Check if data is None, not just empty list
            # This might happen if PostgREST returns an error that isn't an exception
            # or if the response structure is unexpected.
            # print(f"Activity log query returned None data. Response: {response}") # Debug log
            raise HTTPException(status_code=500, detail="Failed to fetch activity logs or no data returned.")

        items = []
        for log_entry in response.data:
            user_details = log_entry.pop('users', None) # Remove 'users' and get its value
            items.append(ActivityLogEntryResponse(
                id=log_entry["id"],
                company_id=log_entry["company_id"],
                user_id=log_entry["user_id"],
                user_email=user_details.get("email") if user_details else None,
                user_name=user_details.get("name") if user_details else None,
                activity_type=log_entry["activity_type"],
                entity_type=log_entry.get("entity_type"),
                entity_id=log_entry.get("entity_id"),
                description=log_entry["description"],
                created_at=log_entry["created_at"]
            ))
        
        total_count = response.count if response.count is not None else 0
        total_pages = math.ceil(total_count / per_page)

        return PaginatedActivityLogResponse(
            items=items,
            total=total_count,
            page=page,
            per_page=per_page,
            pages=total_pages
        )

    except Exception as e:
        # Log the error details for debugging
        # print(f"Error fetching activity logs: {e}") # Replace with proper logging
        # Check for specific PostgREST errors if possible, e.g., from e.details
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching activity logs: {str(e)}")
