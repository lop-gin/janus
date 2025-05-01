from fastapi import APIRouter, Depends, HTTPException, status
from models.roles import Role, RoleCreate
from dependencies.auth import get_current_user, check_permission
from utils.supabase import get_supabase
from supabase import Client
import json

router = APIRouter()

@router.get("/", response_model=list[Role])
async def get_roles(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("role_management", "view"))
):
    """Retrieve all roles for the user's company."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    response = supabase.table("roles").select("*").eq("company_id", company_id).execute()
    return response.data or []

@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
async def create_role(
    role: RoleCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("role_management", "create"))
):
    """Create a new role with specified permissions and color."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    role_data = role.dict()
    role_data["company_id"] = company_id
    role_data["created_by"] = user_id
    role_data["updated_by"] = user_id
    role_data["permissions"] = json.dumps(role_data["permissions"])  # Serialize JSONB

    try:
        response = supabase.table("roles").insert(role_data).execute()
    except Exception as e:
        if "unique_role_name_per_company" in str(e):
            raise HTTPException(status_code=400, detail="Role name already exists for this company")
        raise HTTPException(status_code=400, detail=f"Failed to create role: {str(e)}")

    if response.data:
        created_role = response.data[0]
        created_role["permissions"] = json.loads(created_role["permissions"] or "{}")

        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": "create_role",
            "entity_type": "role",
            "entity_id": created_role["id"],
            "description": f"Created role '{role.role_name}'",
            "details": {"role_name": role.role_name, "color": role.color}
        }).execute()

        return created_role
    raise HTTPException(status_code=400, detail="Failed to create role")

@router.put("/{id}", response_model=Role)
async def update_role(
    id: int,
    role: RoleCreate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("role_management", "edit"))
):
    """Update an existing role, preventing changes to system roles."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    # Check if role is system role
    role_check = supabase.table("roles").select("is_system_role").eq("id", id).eq("company_id", company_id).execute()
    if role_check.data and role_check.data[0]["is_system_role"]:
        raise HTTPException(status_code=403, detail="Cannot modify system roles")

    role_data = role.dict()
    role_data["company_id"] = company_id
    role_data["updated_by"] = user_id
    role_data["permissions"] = json.dumps(role_data["permissions"])

    try:
        response = supabase.table("roles").update(role_data).eq("id", id).eq("company_id", company_id).execute()
    except Exception as e:
        if "unique_role_name_per_company" in str(e):
            raise HTTPException(status_code=400, detail="Role name already exists for this company")
        raise HTTPException(status_code=400, detail=f"Failed to update role: {str(e)}")

    if response.data:
        updated_role = response.data[0]
        updated_role["permissions"] = json.loads(updated_role["permissions"] or "{}")

        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": "update_role",
            "entity_type": "role",
            "entity_id": id,
            "description": f"Updated role '{role.role_name}'",
            "details": {"role_name": role.role_name, "color": role.color}
        }).execute()

        return updated_role
    raise HTTPException(status_code=404, detail="Role not found")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    id: int,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("role_management", "delete"))
):
    """Delete a role, preventing deletion of system roles."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    # Check if role is system role
    role_check = supabase.table("roles").select("is_system_role, role_name").eq("id", id).eq("company_id", company_id).execute()
    if not role_check.data:
        raise HTTPException(status_code=404, detail="Role not found")
    if role_check.data[0]["is_system_role"]:
        raise HTTPException(status_code=403, detail="Cannot delete system roles")

    response = supabase.table("roles").delete().eq("id", id).eq("company_id", company_id).execute()
    if response.data:
        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": "delete_role",
            "entity_type": "role",
            "entity_id": id,
            "description": f"Deleted role '{role_check.data[0]['role_name']}'",
            "details": {"role_name": role_check.data[0]["role_name"]}
        }).execute()
        return
    raise HTTPException(status_code=404, detail="Role not found")