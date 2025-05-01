from fastapi import APIRouter, Depends, HTTPException, status
from models.users import User, UserInvite, UserUpdate
from dependencies.auth import get_current_user, check_permission
from utils.supabase import get_supabase
from supabase import Client
from typing import List
import json

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management"))
):
    """Retrieve all users for the user's company."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    
    # Get users
    users_response = supabase.table("users").select("*").eq("company_id", company_id).execute()
    users = users_response.data or []
    
    # Get roles for each user
    for user in users:
        user_roles = supabase.table("user_roles").select("role_id").eq("user_id", user["id"]).execute()
        role_ids = [ur["role_id"] for ur in user_roles.data]
        roles = supabase.table("roles").select("role_name").in_("id", role_ids).execute()
        user["roles"] = [r["role_name"] for r in roles.data]
    
    return users

@router.post("/invite", response_model=User)
async def invite_user(
    user_invite: UserInvite,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management"))
):
    """Invite a new user to the company."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    # Create user in Supabase Auth
    try:
        auth_response = supabase.auth.admin.invite_user_by_email(
            user_invite.email,
            data={"name": user_invite.name, "company_id": company_id}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to invite user: {str(e)}")

    # Insert user in users table
    user_data = {
        "auth_user_id": auth_response.user.id,
        "company_id": company_id,
        "name": user_invite.name,
        "email": user_invite.email,
        "phone": user_invite.phone,
        "gender": user_invite.gender,
        "is_active": True,
        "created_by": user_id,
        "updated_by": user_id
    }
    user_response = supabase.table("users").insert(user_data).execute()
    if not user_response.data:
        raise HTTPException(status_code=400, detail="Failed to create user")

    created_user = user_response.data[0]
    created_user["roles"] = user_invite.roles or []

    # Assign roles if provided
    if user_invite.roles:
        role_ids = supabase.table("roles").select("id").in_("role_name", user_invite.roles).eq("company_id", company_id).execute()
        role_ids = [r["id"] for r in role_ids.data]
        role_assignments = [{"user_id": created_user["id"], "role_id": rid} for rid in role_ids]
        if role_assignments:
            supabase.table("user_roles").insert(role_assignments).execute()
            created_user["roles"] = user_invite.roles

    # Log to activity_log
    supabase.table("activity_log").insert({
        "company_id": company_id,
        "user_id": user_id,
        "activity_type": "invite_user",
        "entity_type": "user",
        "entity_id": created_user["id"],
        "description": f"Invited user '{user_invite.name}'",
        "details": {"email": user_invite.email, "roles": user_invite.roles}
    }).execute()

    return created_user

@router.post("/roles")
async def assign_roles(
    data: dict,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management"))
):
    """Assign roles to a user."""
    user_id = data.get("user_id")
    role_ids = data.get("role_ids", [])
    
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    current_user_id = user_response.data[0]["id"]

    # Verify user exists
    target_user = supabase.table("users").select("id").eq("id", user_id).eq("company_id", company_id).execute()
    if not target_user.data:
        raise HTTPException(status_code=404, detail="Target user not found")

    # Verify roles exist
    valid_roles = supabase.table("roles").select("id").in_("id", role_ids).eq("company_id", company_id).execute()
    valid_role_ids = [r["id"] for r in valid_roles.data]
    if len(valid_role_ids) != len(role_ids):
        raise HTTPException(status_code=400, detail="Invalid role IDs")

    # Clear existing roles
    supabase.table("user_roles").delete().eq("user_id", user_id).execute()

    # Assign new roles
    role_assignments = [{"user_id": user_id, "role_id": rid} for rid in valid_role_ids]
    if role_assignments:
        supabase.table("user_roles").insert(role_assignments).execute()

    # Log to activity_log
    supabase.table("activity_log").insert({
        "company_id": company_id,
        "user_id": current_user_id,
        "activity_type": "assign_roles",
        "entity_type": "user",
        "entity_id": user_id,
        "description": f"Assigned roles to user ID {user_id}",
        "details": {"role_ids": role_ids}
    }).execute()

    return {"message": "Roles assigned successfully"}

@router.put("/{id}", response_model=User)
async def update_user(
    id: int,
    user_update: UserUpdate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management"))
):
    """Update user status."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    current_user_id = user_response.data[0]["id"]

    user_data = user_update.dict(exclude_unset=True)
    user_data["updated_by"] = current_user_id

    response = supabase.table("users").update(user_data).eq("id", id).eq("company_id", company_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = response.data[0]
    user_roles = supabase.table("user_roles").select("role_id").eq("user_id", id).execute()
    role_ids = [ur["role_id"] for ur in user_roles.data]
    roles = supabase.table("roles").select("role_name").in_("id", role_ids).execute()
    updated_user["roles"] = [r["role_name"] for r in roles.data]

    # Log to activity_log
    supabase.table("activity_log").insert({
        "company_id": company_id,
        "user_id": current_user_id,
        "activity_type": "update_user",
        "entity_type": "user",
        "entity_id": id,
        "description": f"Updated user '{updated_user['name']}'",
        "details": {"is_active": user_update.is_active}
    }).execute()

    return updated_user

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    id: int,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management"))
):
    """Delete a user."""
    user_response = supabase.table("users").select("company_id, id, name").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    current_user_id = user_response.data[0]["id"]

    target_user = supabase.table("users").select("name").eq("id", id).eq("company_id", company_id).execute()
    if not target_user.data:
        raise HTTPException(status_code=404, detail="User not found")

    response = supabase.table("users").delete().eq("id", id).eq("company_id", company_id).execute()
    if response.data:
        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": current_user_id,
            "activity_type": "delete_user",
            "entity_type": "user",
            "entity_id": id,
            "description": f"Deleted user '{target_user.data[0]['name']}'",
            "details": {}
        }).execute()
        return
    raise HTTPException(status_code=404, detail="User not found")