from fastapi import APIRouter, Depends, HTTPException, status, Query
from models.users import User, UserInvite, UserUpdate, UserRoleAssignment
from dependencies.auth import get_current_user, check_permission
from utils.supabase import get_supabase
from supabase import Client
import json

router = APIRouter()

@router.get("/", response_model=list[User])
async def get_users(
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management", "view"))
):
    """Retrieve all users for the user's company with their roles."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]

    # Fetch users with their roles
    response = supabase.table("users").select("id, company_id, name, email, phone, gender, avatar_url, is_active, created_at, updated_at, user_roles!inner(roles(role_name))").eq("company_id", company_id).execute()
    users = response.data or []
    for user in users:
        user["roles"] = [ur["roles"]["role_name"] for ur in user["user_roles"]]
        del user["user_roles"]
    return users

@router.get("/roles", response_model=list[dict])
async def get_user_roles(
    user_id: int = Query(...),
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management", "view"))
):
    """Retrieve roles assigned to a specific user."""
    user_response = supabase.table("users").select("company_id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]

    # Verify user exists
    target_user = supabase.table("users").select("id").eq("id", user_id).eq("company_id", company_id).execute()
    if not target_user.data:
        raise HTTPException(status_code=404, detail="User not found")

    response = supabase.table("user_roles").select("role_id, roles!inner(role_name)").eq("user_id", user_id).execute()
    return [{"role_id": r["role_id"], "role_name": r["roles"]["role_name"]} for r in response.data] or []

@router.post("/invite", response_model=User, status_code=status.HTTP_201_CREATED)
async def invite_user(
    invite: UserInvite,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management", "create"))
):
    """Invite a new user via Supabase Auth email invite."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    # Check if email already exists
    existing_user = supabase.table("users").select("id").eq("email", invite.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Send invite via Supabase Auth
    auth_response = supabase.auth.admin.invite_user_by_email(
        email=invite.email,
        data={
            "company_id": company_id,
            "name": invite.name,
            "phone": invite.phone,
            "gender": invite.gender
        }
    )
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Failed to send invite")

    # Insert user into users table
    user_data = {
        "company_id": company_id,
        "name": invite.name,
        "email": invite.email,
        "phone": invite.phone,
        "gender": invite.gender,
        "auth_user_id": auth_response.user.id,
        "password_hash": "managed_by_supabase",
        "is_active": True,
        "created_by": user_id,
        "updated_by": user_id
    }
    response = supabase.table("users").insert(user_data).execute()

    if response.data:
        created_user = response.data[0]
        created_user["roles"] = []

        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": "invite_user",
            "entity_type": "user",
            "entity_id": created_user["id"],
            "description": f"Invited user '{invite.name}'",
            "details": {"email": invite.email}
        }).execute()

        return created_user
    raise HTTPException(status_code=400, detail="Failed to create user")

@router.put("/{id}", response_model=User)
async def update_user(
    id: int,
    user_update: UserUpdate,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management", "edit"))
):
    """Update user details."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    user_data = user_update.dict(exclude_unset=True)
    user_data["updated_by"] = user_id

    response = supabase.table("users").update(user_data).eq("id", id).eq("company_id", company_id).execute()
    if response.data:
        updated_user = response.data[0]
        updated_user["roles"] = [ur["roles"]["role_name"] for ur in supabase.table("user_roles").select("roles!inner(role_name)").eq("user_id", id).execute().data]

        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": "update_user",
            "entity_type": "user",
            "entity_id": id,
            "description": f"Updated女孩 user '{updated_user['name']}'",
            "details": {"email": updated_user["email"]}
        }).execute()

        return updated_user
    raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    id: int,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management", "delete"))
):
    """Delete a user and their Supabase Auth account."""
    user_response = supabase.table("users").select("company_id, id, auth_user_id, name, email").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    # Get user to delete
    target_user = supabase.table("users").select("auth_user_id, name, email").eq("id", id).eq("company_id", company_id).execute()
    if not target_user.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent self-deletion
    if target_user.data[0]["auth_user_id"] == current_user:
        raise HTTPException(status_code=403, detail="Cannot delete your own account")

    # Delete from Supabase Auth
    supabase.auth.admin.delete_user(target_user.data[0]["auth_user_id"])

    # Delete from users table (cascades to user_roles)
    response = supabase.table("users").delete().eq("id", id).eq("company_id", company_id).execute()
    if response.data:
        # Log to activity_log
        supabase.table("activity_log").insert({
            "company_id": company_id,
            "user_id": user_id,
            "activity_type": "delete_user",
            "entity_type": "user",
            "entity_id": id,
            "description": f"Deleted user '{target_user.data[0]['name']}'",
            "details": {"email": target_user.data[0]["email"]}
        }).execute()
        return
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/roles", response_model=User)
async def assign_user_roles(
    assignment: UserRoleAssignment,
    current_user: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
    _=Depends(check_permission("Employee", "user_management", "edit"))
):
    """Assign roles to a user."""
    user_response = supabase.table("users").select("company_id, id").eq("auth_user_id", current_user).execute()
    if not user_response.data:
        raise HTTPException(status_code=404, detail="User not found")
    company_id = user_response.data[0]["company_id"]
    user_id = user_response.data[0]["id"]

    # Verify user exists
    target_user = supabase.table("users").select("id, name, email").eq("id", assignment.user_id).eq("company_id", company_id).execute()
    if not target_user.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify roles exist and belong to company
    role_ids = assignment.role_ids
    roles_check = supabase.table("roles").select("id").eq("company_id", company_id).in_("id", role_ids).execute()
    if len(roles_check.data) != len(role_ids):
        raise HTTPException(status_code=400, detail="One or more roles are invalid")

    # Delete existing roles
    supabase.table("user_roles").delete().eq("user_id", assignment.user_id).execute()

    # Assign new roles
    for role_id in role_ids:
        supabase.table("user_roles").insert({
            "user_id": assignment.user_id,
            "role_id": role_id,
            "created_by": user_id
        }).execute()

    # Log to activity_log
    supabase.table("activity_log").insert({
        "company_id": company_id,
        "user_id": user_id,
        "activity_type": "assign_roles",
        "entity_type": "user",
        "entity_id": assignment.user_id,
        "description": f"Assigned roles to user '{target_user.data[0]['name']}'",
        "details": {"email": target_user.data[0]["email"], "role_ids": role_ids}
    }).execute()

    # Return updated user with roles
    response = supabase.table("users").select("id, company_id, name, email, phone, gender, avatar_url, is_active, created_at, updated_at, user_roles!inner(roles(role_name))").eq("id", assignment.user_id).execute()
    if response.data:
        user = response.data[0]
        user["roles"] = [ur["roles"]["role_name"] for ur in user["user_roles"]]
        del user["user_roles"]
        return user
    raise HTTPException(status_code=404, detail="User not found")