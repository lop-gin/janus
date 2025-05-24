from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.services.activity_service import get_user_details_for_logging # Reusing this
from uuid import UUID
import jwt # Placeholder for actual JWT library like python-jose
from app.core.config import settings # Assuming settings might have JWT secret if we were decoding here

# This is where your JWT settings would be (secret key, algorithm)
# For now, this is a conceptual placeholder.
# In a real Supabase setup, the client itself can be configured to handle auth,
# or you might get user from supabase.auth.get_user(jwt=token_from_header)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/signin") # Dummy tokenUrl

class CurrentUserPublicDetails:
    def __init__(self, public_user_id: int, company_id: int, auth_user_id: UUID):
        self.public_user_id = public_user_id
        self.company_id = company_id
        self.auth_user_id = auth_user_id


async def get_current_user_auth_id_placeholder(token: str = Depends(oauth2_scheme)) -> UUID:
    """
    Placeholder for JWT decoding. In a real app, this would decode the token
    and return the user's auth ID (UUID).
    For Supabase, you might use supabase.auth.get_user(jwt=token)
    """
    # --- THIS IS A MOCK ---
    # Replace with actual token validation and user extraction logic
    if not token: # Should be caught by OAuth2PasswordBearer if no token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        # Example: payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        # auth_user_id_str = payload.get("sub") # "sub" is often the user ID in JWT
        # For Supabase, this is typically the UUID of the user in auth.users
        
        # Mocking: Assume token is the auth_user_id itself for this placeholder
        # In reality, you'd get this from supabase.auth.get_user() or by decoding a custom JWT
        # For now, let's assume a test UUID or raise if not a valid UUID format
        # THIS IS HIGHLY INSECURE AND FOR TESTING/PLACEHOLDER ONLY
        if token == "test_user_jwt_for_user_1_company_1": # Example of a mock token
            # This would be a UUID from your auth.users table for a known test user
            return UUID("00000000-0000-0000-0000-000000000001") 
        elif token == "test_user_jwt_for_user_2_company_1":
            return UUID("00000000-0000-0000-0000-000000000002")
        
        # A more realistic placeholder if you pass a UUID as a token during tests:
        try:
            return UUID(token)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token format (mock).")

    except jwt.PyJWTError: # Or the specific exception from your JWT library
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials (mock)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # --- END MOCK ---
    # Default fallback, should be replaced by real logic
    # For now, we'll try to cast token to UUID if it's not a mock one.
    # This is still placeholder behavior.
    try:
        return UUID(token) # This allows passing a UUID directly as token for testing
    except ValueError:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token or mock user not found.")


async def get_current_user_public_details(
    auth_user_id: UUID = Depends(get_current_user_auth_id_placeholder)
) -> CurrentUserPublicDetails:
    """
    Dependency to get the current user's public.users.id and company_id.
    Relies on get_user_details_for_logging to query based on auth_user_id.
    """
    if not auth_user_id: # Should be caught by previous dependency
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")

    public_user_id, company_id = await get_user_details_for_logging(auth_user_id)

    if public_user_id is None or company_id is None:
        # This means the user exists in auth.users but not in public.users or is misconfigured.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User profile not found or incomplete."
        )
    return CurrentUserPublicDetails(
        public_user_id=public_user_id, 
        company_id=company_id,
        auth_user_id=auth_user_id
    )


# Dependency for checking role management permissions
def verify_role_management_permission(required_action: str):
    async def _verify_permission(
        current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
        supabase: Client = Depends(get_supabase_admin_client) # Assuming get_supabase_admin_client is defined
    ):
        if not current_user or not current_user.public_user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        # 1. Fetch user's roles from user_roles table based on public_user_id
        user_roles_response = await supabase.table("user_roles").select(
            "roles(role_name, permissions, is_system_role)" # Join with roles table
        ).eq(
            "user_id", current_user.public_user_id
        ).execute()
        
        # print(f"User roles response for user {current_user.public_user_id}: {user_roles_response}") # Debug

        if user_roles_response.data is None: # Check for None, not just empty list
             # This could happen if the RPC/function call itself fails or returns unexpected structure
             # For direct table access, it's more likely to be an empty list if no roles found.
             # However, if an error occurs (e.g. PostgrestError), it should be caught.
             # Let's assume if .data is None, it's an issue, or if it's an empty list, user has no roles.
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not retrieve user roles.")

        if not user_roles_response.data: # Empty list means user has no roles assigned
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no assigned roles.")

        user_permissions: dict[str, list[str]] = {}
        is_super_admin = False

        for role_entry in user_roles_response.data:
            role_details = role_entry.get('roles') # 'roles' is the joined data
            if not role_details:
                # This means a user_role entry exists but the corresponding role in roles table is missing.
                # This indicates a data integrity issue.
                # print(f"Warning: User role entry for user {current_user.public_user_id} links to a non-existent role.") # Debug
                continue # Skip this role entry

            # print(f"Processing role: {role_details.get('role_name')}") # Debug

            if role_details.get('is_system_role') and role_details.get('role_name') == "Super Admin":
                is_super_admin = True
                # print("User is Super Admin") # Debug
                break # Super Admin has all permissions

            role_perms = role_details.get('permissions', {})
            if isinstance(role_perms, dict):
                for module, actions in role_perms.items():
                    if module not in user_permissions:
                        user_permissions[module] = []
                    if isinstance(actions, list):
                        user_permissions[module].extend(actions)
                        user_permissions[module] = list(set(user_permissions[module])) # Make unique
        
        # print(f"User is_super_admin: {is_super_admin}") # Debug
        # print(f"User aggregated permissions: {user_permissions}") # Debug

        if is_super_admin:
            return True # Super Admin can do anything

        # Check for specific permission if not Super Admin
        module_permissions = user_permissions.get("role_management", [])
        
        # print(f"Required action: {required_action}, Module permissions for role_management: {module_permissions}") # Debug

        if "manage" in module_permissions or required_action in module_permissions:
            return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"User does not have '{required_action}' permission for role management."
        )
    return _verify_permission

# Re-import Supabase client if not already available globally or passed around
from app.core.supabase_client import get_supabase_admin_client
from supabase import Client


# Dependency for checking user management permissions
def verify_user_management_permission(required_action: str):
    async def _verify_permission(
        current_user: CurrentUserPublicDetails = Depends(get_current_user_public_details),
        supabase: Client = Depends(get_supabase_admin_client)
    ):
        if not current_user or not current_user.public_user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not authenticated.")

        user_roles_response = await supabase.table("user_roles").select(
            "roles(role_name, permissions, is_system_role)"
        ).eq(
            "user_id", current_user.public_user_id
        ).execute()
        
        if user_roles_response.data is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not retrieve user roles.")
        if not user_roles_response.data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User has no assigned roles.")

        user_permissions: dict[str, list[str]] = {}
        is_super_admin = False

        for role_entry in user_roles_response.data:
            role_details = role_entry.get('roles')
            if not role_details:
                continue

            if role_details.get('is_system_role') and role_details.get('role_name') == "Super Admin":
                is_super_admin = True
                break 

            role_perms = role_details.get('permissions', {})
            if isinstance(role_perms, dict):
                for module, actions in role_perms.items():
                    if module not in user_permissions:
                        user_permissions[module] = []
                    if isinstance(actions, list):
                        user_permissions[module].extend(actions)
                        user_permissions[module] = list(set(user_permissions[module]))
        
        if is_super_admin:
            return True

        module_permissions = user_permissions.get("user_management", [])
        
        if "manage" in module_permissions or required_action in module_permissions:
            return True
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"User does not have '{required_action}' permission for user management."
        )
    return _verify_permission
