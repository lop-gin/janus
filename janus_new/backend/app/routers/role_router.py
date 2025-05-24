from fastapi import APIRouter, Depends, HTTPException, status, Path
from typing import List
from app.schemas.role_schemas import RoleCreate, RoleUpdate, RoleResponse
from app.schemas.auth_schemas import MessageResponse # Reusing from auth_schemas
from app.core.supabase_client import get_supabase_admin_client
from app.dependencies.auth_deps import get_current_user_public_details, CurrentUserPublicDetails, verify_role_management_permission
from app.services.activity_service import record_activity
from supabase import Client as SupabaseClient
from supabase.lib.client_options import ClientOptions
from gotrue.errors import AuthApiError # Though we're using Postgrest for DB ops mainly
from postgrest import APIError as PostgrestAPIError # For Postgrest specific errors


router = APIRouter()

# Helper function to check if a role name already exists for the company
async def check_role_name_exists(supabase: SupabaseClient, company_id: int, role_name: str, exclude_role_id: int | None = None) -> bool:
    query = supabase.table("roles").select("id", count="exact").eq("company_id", company_id).eq("role_name", role_name)
    if exclude_role_id:
        query = query.neq("id", exclude_role_id)
    response = await query.execute()
    return response.count > 0


@router.post(
    "/", 
    response_model=RoleResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_role_management_permission("create"))]
)
async def create_role(
    role_in: RoleCreate,
    current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    if await check_role_name_exists(supabase, current_user.company_id, role_in.role_name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A role with this name already exists for your company."
        )

    new_role_data = role_in.model_dump()
    new_role_data["company_id"] = current_user.company_id
    new_role_data["is_system_role"] = False # User-created roles are not system roles
    new_role_data["created_by"] = current_user.public_user_id 
    new_role_data["updated_by"] = current_user.public_user_id

    try:
        response = await supabase.table("roles").insert(new_role_data).select("*").single().execute()
        created_role = response.data
    except PostgrestAPIError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {e.message}")
    
    if not created_role:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create role.")

    # Activity Log
    try:
        await record_activity(
            company_id=current_user.company_id,
            user_id=current_user.public_user_id,
            activity_type="role_created",
            description=f"Role '{created_role['role_name']}' created.",
            entity_type="role",
            entity_id=created_role['id']
        )
    except Exception as e:
        print(f"Failed to record role_created activity: {e}") # Log and continue

    return created_role


@router.get(
    "/", 
    response_model=List[RoleResponse],
    dependencies=[Depends(verify_role_management_permission("read"))]
)
async def list_roles(
    current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        response = await supabase.table("roles").select("*").eq("company_id", current_user.company_id).order("role_name").execute()
        return response.data
    except PostgrestAPIError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {e.message}")


@router.get(
    "/{role_id}", 
    response_model=RoleResponse,
    dependencies=[Depends(verify_role_management_permission("read"))]
)
async def get_role(
    role_id: int = Path(..., title="The ID of the role to get"),
    current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        response = await supabase.table("roles").select("*").eq("id", role_id).eq("company_id", current_user.company_id).single().execute()
        role = response.data
    except PostgrestAPIError as e:
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {e.message}")

    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found or not part of your company.")
    return role


@router.put(
    "/{role_id}", 
    response_model=RoleResponse,
    dependencies=[Depends(verify_role_management_permission("update"))]
)
async def update_role(
    role_update: RoleUpdate,
    role_id: int = Path(..., title="The ID of the role to update"),
    current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    # Fetch existing role first
    try:
        existing_role_response = await supabase.table("roles").select("*").eq("id", role_id).eq("company_id", current_user.company_id).single().execute()
        existing_role = existing_role_response.data
    except PostgrestAPIError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error fetching role: {e.message}")

    if not existing_role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found or not part of your company.")

    if existing_role["is_system_role"] and existing_role["role_name"] == "Super Admin":
        # Prevent modification of Super Admin's name or system role status. Permissions can be context-dependent.
        if role_update.role_name and role_update.role_name != "Super Admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot change the name of the Super Admin role.")
        # For this example, let's say Super Admin permissions are hardcoded or managed elsewhere, so don't allow updates here.
        # Or, if permissions are updatable, ensure they don't lock out system.
        # For simplicity: prevent any update to Super Admin role through this generic endpoint.
        # A dedicated mechanism should handle Super Admin changes if ever needed.
        # raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The Super Admin role cannot be modified through this endpoint.")
        # A more nuanced approach: only allow description updates for Super Admin, or no updates.
        # For now, just preventing name change. Permissions update will be allowed by schema.
        if role_update.permissions: # Example: if we want to restrict permission changes for Super Admin
            print("Warning: Attempting to update permissions for Super Admin. This might be restricted by business logic.")


    update_data = role_update.model_dump(exclude_unset=True) # Get only fields that were set

    if "role_name" in update_data and update_data["role_name"] != existing_role["role_name"]:
        if await check_role_name_exists(supabase, current_user.company_id, update_data["role_name"], exclude_role_id=role_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Another role with this name already exists for your company."
            )
    
    # Ensure is_system_role is not changed for any role via this endpoint
    if "is_system_role" in update_data:
        del update_data["is_system_role"] 
    
    update_data["updated_by"] = current_user.public_user_id
    # updated_at will be handled by DB trigger or Supabase default

    if not update_data: # If nothing to update after checks
        return existing_role # Or raise 400

    try:
        response = await supabase.table("roles").update(update_data).eq("id", role_id).eq("company_id", current_user.company_id).select("*").single().execute()
        updated_role = response.data
    except PostgrestAPIError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error updating role: {e.message}")

    if not updated_role:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update role.") # Should be caught by 404 if not found

    # Activity Log
    try:
        await record_activity(
            company_id=current_user.company_id,
            user_id=current_user.public_user_id,
            activity_type="role_updated",
            description=f"Role '{updated_role['role_name']}' (ID: {role_id}) updated.",
            entity_type="role",
            entity_id=role_id
        )
    except Exception as e:
        print(f"Failed to record role_updated activity: {e}")

    return updated_role


@router.delete(
    "/{role_id}", 
    response_model=MessageResponse,
    dependencies=[Depends(verify_role_management_permission("delete"))]
)
async def delete_role(
    role_id: int = Path(..., title="The ID of the role to delete"),
    current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    # Fetch role to check if it's Super Admin or belongs to the company
    try:
        role_to_delete_response = await supabase.table("roles").select("role_name, is_system_role, company_id").eq("id", role_id).single().execute()
        role_to_delete = role_to_delete_response.data
    except PostgrestAPIError as e:
        # This could be a 404 if single() finds no rows, or other DB error
        if e.code == "PGRST116": # "PGRST116" is PostgREST code for "Not a single row"
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found.")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error fetching role: {e.message}")

    if not role_to_delete: # Should be caught by PGRST116, but double check
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found.")

    if role_to_delete["company_id"] != current_user.company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete a role not belonging to your company.")

    if role_to_delete["is_system_role"] and role_to_delete["role_name"] == "Super Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The Super Admin role cannot be deleted.")

    # Check if role is assigned to any users
    # This is an advanced check. For now, let's keep it simple as per task note.
    # user_roles_check = await supabase.table("user_roles").select("id", count="exact").eq("role_id", role_id).execute()
    # if user_roles_check.count > 0:
    #     raise HTTPException(
    #         status_code=status.HTTP_409_CONFLICT,
    #         detail=f"Cannot delete role '{role_to_delete['role_name']}' as it is currently assigned to {user_roles_check.count} user(s)."
    #     )

    try:
        await supabase.table("roles").delete().eq("id", role_id).eq("company_id", current_user.company_id).execute()
        # Delete does not return data by default unless select() is chained, but we check by absence of error.
    except PostgrestAPIError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error deleting role: {e.message}")

    # Activity Log
    try:
        await record_activity(
            company_id=current_user.company_id,
            user_id=current_user.public_user_id,
            activity_type="role_deleted",
            description=f"Role '{role_to_delete['role_name']}' (ID: {role_id}) deleted.",
            entity_type="role",
            entity_id=role_id
        )
    except Exception as e:
        print(f"Failed to record role_deleted activity: {e}")

    return MessageResponse(message=f"Role '{role_to_delete['role_name']}' deleted successfully.")
