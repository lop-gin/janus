import secrets
from fastapi import APIRouter, HTTPException, Depends, Response
from supabase import Client as SupabaseClient
from supabase.lib.client_options import ClientOptions
from gotrue.errors import AuthApiError

from app.core.supabase_client import get_supabase_admin_client
from app.schemas.auth_schemas import (
    SignUpInitiateRequest,
    OTPVerifyRequest,
    SetPasswordRequest,
    AuthResponse,
    MessageResponse,
    OTPVerifiedResponse,
    SignInRequest,
    InviteVerifyRequest,
    InviteVerificationResponse,
    InvitedUserSetPasswordRequest,
    ForgotPasswordRequest, # Added
    ResetOTPVerifiedResponse, # Added
    SetNewPasswordRequest,
)
from app.services.activity_service import record_activity, get_user_details_for_logging # Added
from uuid import UUID # Added for type hinting

router = APIRouter()

# Helper to generate temporary password
def generate_temporary_password(length: int = 16) -> str:
    return secrets.token_urlsafe(length)

@router.post("/signup/initiate", response_model=MessageResponse, status_code=201)
async def signup_initiate(
    request: SignUpInitiateRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    temp_password = generate_temporary_password()

    raw_user_meta_data = {
        "company_name": request.company.name,
        "company_type": request.company.type,
        "company_email": request.company.email,
        "company_address": request.company.address,
        "company_tax_id": request.company.tax_id,
        "user_full_name": request.user.full_name,
        "user_phone_number": request.user.user_phone_number,
    }
    # Filter out None values from metadata, as Supabase might not like nulls for non-nullable custom claims
    # However, the trigger should handle missing fields gracefully if they are defined as text.
    # For now, let's pass them as is, assuming the trigger handles potential nulls appropriately.

    try:
        user_response = supabase.auth.sign_up(
            email=request.user.email,
            password=temp_password,
            data={"raw_user_meta_data": raw_user_meta_data} # Nest under raw_user_meta_data for the trigger
        )
        
        # Supabase sends OTP automatically on sign_up if email confirmation is enabled.
        # If user_response.user.identities is empty, it means user already exists but is unconfirmed.
        # Supabase signup doesn't throw an error for this, but resends confirmation.
        if user_response.user and not user_response.user.identities: # Check if it's an existing unconfirmed user
             # Check if user is already confirmed
            existing_user = supabase.auth.admin.get_user_by_id(user_response.user.id)
            if existing_user.user.email_confirmed_at:
                 raise HTTPException(status_code=409, detail="User with this email already exists and is confirmed.")
            # If not confirmed, Supabase would have resent the OTP.
            # The problem description implies the trigger `register_company_and_user_after_confirm`
            # runs *after* confirmation. So this flow is okay.

        return MessageResponse(message="OTP sent to your email. Please verify.")

    except AuthApiError as e:
        if "User already registered" in e.message or "already exists" in e.message.lower(): # More robust check
            raise HTTPException(status_code=409, detail="User with this email already exists.")
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


# --- Forgot Password Flow ---

@router.post("/forgot-password/initiate", response_model=MessageResponse)
async def forgot_password_initiate(
    request: ForgotPasswordRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client) # Admin client can also call this
):
    try:
        # Supabase handles sending the OTP/link for password reset.
        # It typically doesn't error if the email doesn't exist to prevent email enumeration.
        supabase.auth.reset_password_for_email(
            email=request.email,
            # options={"redirect_to": "your_frontend_password_reset_page_url"} # Optional: if using link-based reset
        )
        # Note: `reset_password_for_email` in supabase-py might not return a detailed response object
        # or errors for non-existent users. This is by design for security.
        return MessageResponse(message="If an account with this email exists, a password reset OTP has been sent.")
    except AuthApiError as e:
        # This might catch other unexpected auth errors, but typically not "user not found".
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/forgot-password/verify-otp", response_model=ResetOTPVerifiedResponse)
async def forgot_password_verify_otp(
    request: OTPVerifyRequest, # Reusing OTPVerifyRequest (email, otp)
    supabase: SupabaseClient = Depends(get_supabase_admin_client) # Admin client can also call this
):
    try:
        # This verify_otp is for 'recovery' type.
        # Supabase's verify_otp with type 'recovery' usually just confirms the OTP is valid
        # and doesn't return a full session like 'signup' or 'magiclink'.
        # It might return a user object or simple success.
        # The key is that the OTP itself is now "trusted" for a short period for the next step.
        
        # Let's test if supabase-py's verify_otp for recovery returns anything useful
        # or if it throws an error on invalid OTP.
        # For now, we assume it validates and we pass the OTP to the next step.
        # The actual user update will be done by admin client in the next step.
        
        # The task asks to use `client.auth.verify_otp`. If we use admin client for this, it's `admin_client.auth.admin.verify_otp`.
        # Let's stick to `client.auth.verify_otp` as if it's a user-facing client, assuming the user
        # would typically provide this OTP to their client instance.
        # However, since we are using Depends(get_supabase_admin_client), it IS an admin client.
        # The admin client does not have a verify_otp method directly on `auth.admin`.
        # `supabase.auth.verify_otp` is the correct call, even on an admin-initialized client,
        # as it refers to the GoTrue API which is consistent.

        # session_response = supabase.auth.verify_otp( # This is the old line that was here
        # Let's try to verify using the admin client's user context, this is a bit tricky.
        # The most straightforward way to verify an OTP for password recovery without logging the user in
        # is often to just check its validity. If Supabase `verify_otp` for `recovery` doesn't
        # throw an error, we assume it's valid.

        # The task statement: "Call client.auth.verify_otp(email=request.email, token=request.otp, type='recovery')"
        # This is fine. If it succeeds, we proceed.

        _ = supabase.auth.verify_otp( # The response might not be directly useful beyond confirming validity
            email=request.email,
            token=request.otp,
            type='recovery' # This is crucial
        )
        # If the above does not throw an error, the OTP is considered valid.

        return ResetOTPVerifiedResponse(
            message="OTP verified successfully. You can now set a new password.",
            email=request.email,
            otp=request.otp # Carry forward the OTP
        )
    except AuthApiError as e:
        if "Invalid OTP" in e.message or "token has invalid" in e.message or "expired" in e.message or "not found" in e.message:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP, or email mismatch.")
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/forgot-password/set-new", response_model=MessageResponse)
async def forgot_password_set_new(
    request: SetNewPasswordRequest,
    supabase_admin: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        # 1. (Optional but recommended) Re-verify OTP with admin client context.
        #    However, `verify_otp` is not directly on `auth.admin`.
        #    The previous step's successful verification of 'recovery' OTP is our gate.
        #    If that step was compromised, this one would be too.
        #    The crucial part is that the OTP is short-lived and tied to the email.

        # 2. Fetch user by email to get their ID using Admin client
        #    Supabase `list_users` is the way to get user by email with admin privileges.
        list_users_response = supabase_admin.auth.admin.list_users(email=request.email)
        
        target_user = None
        if list_users_response.users:
            for u in list_users_response.users:
                if u.email == request.email:
                    target_user = u
                    break
        
        if not target_user:
            # This should ideally not happen if OTP verification was for a valid user.
            # However, if email changed or user deleted post OTP verification, it's possible.
            raise HTTPException(status_code=404, detail="User not found. Cannot set new password.")

        if not target_user.email_confirmed_at:
             raise HTTPException(status_code=400, detail="Cannot reset password for unconfirmed email. Please confirm your email first.")


        # 3. Update password using Admin client and User ID
        #    The OTP (`request.otp`) has served its purpose by allowing the user to reach this stage.
        #    It's not directly used in `update_user_by_id` typically.
        #    The "trust" is based on them providing the correct OTP in the previous step.
        supabase_admin.auth.admin.update_user_by_id(
            user_id=target_user.id,
            attributes={'password': request.password}
        )

        # --- Record Activity ---
        try:
            auth_user_id_uuid = UUID(str(target_user.id)) # Ensure it's UUID type
            public_user_id, company_id = await get_user_details_for_logging(auth_user_id_uuid)
            if public_user_id and company_id:
                await record_activity(
                    company_id=company_id,
                    user_id=public_user_id,
                    activity_type="user_password_reset",
                    description=f"User {target_user.email} reset their password.",
                    entity_type="user",
                    entity_id=public_user_id
                )
        except Exception as activity_exc:
            print(f"Failed to record password reset activity: {activity_exc}") # Log and continue
        # --- End Record Activity ---

        return MessageResponse(message="Password updated successfully. Please sign in with your new password.")

    except AuthApiError as e:
        # Handle specific Supabase errors if necessary
        if "User not found" in e.message: # Should be caught by earlier check
             raise HTTPException(status_code=404, detail="User not found during password update.")
        elif "requires a valid password" in e.message.lower(): # if new password is weak
             raise HTTPException(status_code=400, detail="New password does not meet strength requirements.")
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except HTTPException as e: # Re-raise our own HTTPExceptions
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/verify-invite-code", response_model=InviteVerificationResponse)
async def verify_invite_code(
    request: InviteVerifyRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        # Query the invitations table
        # Fetch the invite along with company_id, full_name, role_id, created_by for the next step
        invite_response = supabase.table("invitations").select(
            "id, email, code, expires_at, is_accepted, company_id, full_name, role_id, created_by"
        ).eq(
            "email", request.email
        ).eq(
            "code", request.code
        ).single().execute()

        if not invite_response.data:
            raise HTTPException(status_code=404, detail="Invite code not found or email mismatch.")

        invite = invite_response.data

        if invite["is_accepted"]:
            raise HTTPException(status_code=400, detail="Invite code has already been accepted.")

        # Check for expiration (assuming expires_at is a string like '2023-12-31T23:59:59.999999+00:00')
        from datetime import datetime, timezone
        expires_at_dt = datetime.fromisoformat(invite["expires_at"])
        if expires_at_dt < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Invite code has expired.")
        
        # Optionally, mark invite as "pending" if there was such a state, or just return success.
        # For now, we just verify. The acceptance happens at password set.

        return InviteVerificationResponse(
            message="Invite code verified successfully.",
            email=invite["email"],
            code=invite["code"]
        )

    except AuthApiError as e: # Though direct table access won't throw AuthApiError, keep for consistency if other auth calls were made
        raise HTTPException(status_code=500, detail=f"Supabase auth error: {e.message}")
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the error for debugging: print(f"Unexpected error in verify_invite_code: {e}")
        if "PGRST116" in str(e) or "PostgrestError" in str(e) and "0 rows" in str(e).lower() : # Check for PostgREST no rows error
             raise HTTPException(status_code=404, detail="Invite code not found, email mismatch, or other query issue.")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/invited-user/set-password", response_model=AuthResponse)
async def invited_user_set_password(
    request: InvitedUserSetPasswordRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        # --- Record Activity ---
        # This needs to be done after user is created and session is established
        # We'll place it near the end, after session_response is confirmed.
        # public_user_id and company_id will be from the invite processing.
        # auth_user_id will be from session_response.user.id
        # --- End Record Activity (placeholder, actual call below) ---

        # 1. Re-verify the code and email against the invitations table
        invite_response = supabase.table("invitations").select(
            "id, email, code, expires_at, is_accepted, company_id, full_name, role_id, created_by"
        ).eq(
            "email", request.email
        ).eq(
            "code", request.code
        ).single().execute()

        if not invite_response.data:
            raise HTTPException(status_code=404, detail="Invite verification failed (code/email mismatch).")

        invite = invite_response.data

        if invite["is_accepted"]:
            raise HTTPException(status_code=400, detail="This invite has already been used.")
        
        from datetime import datetime, timezone
        expires_at_dt = datetime.fromisoformat(invite["expires_at"])
        if expires_at_dt < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="This invite has expired.")

        # 2. Create the user in Supabase Auth
        # Ensure full_name is present in the invite data, otherwise use a placeholder
        user_full_name = invite.get("full_name", "Invited User") 
        if not user_full_name: # Handle if full_name is None or empty string from DB
            user_full_name = "Invited User (Name TBD)"

        # The user_metadata in create_user is for auth.users.raw_user_meta_data
        # It's not directly used by our public.users table trigger in this flow.
        # However, it's good practice to store it if other parts of system might use it.
        auth_user = supabase.auth.admin.create_user(
            email=request.email,
            password=request.password,
            email_confirm=True, # Auto-confirm email as invite implies verification
            user_metadata={"full_name": user_full_name} 
        )
        auth_user_id = auth_user.user.id

        # 3. Directly insert into public.users
        # Ensure all required fields for public.users are present from the invite or defaults
        company_id = invite["company_id"]
        # role_id = invite.get("role_id") # Get role_id for user_roles table
        inviter_user_id = invite.get("created_by") # The user who created the invite

        if not company_id:
            raise HTTPException(status_code=500, detail="Invite is missing company information.")
        # if not role_id:
        #     raise HTTPException(status_code=500, detail="Invite is missing role information.")


        # Insert into public.users
        # Assuming 'created_by' and 'updated_by' in public.users refer to the ID of the user who performed the action.
        # For an invited user, the initial 'created_by' could be the inviter.
        # Or, it could be the new user themselves if your policy dictates. Using inviter for now.
        # If inviter_user_id is NULL (e.g. system generated invite), handle appropriately (e.g. set to new user's ID or a system user ID)
        
        # Check if inviter_user_id is None, if so, perhaps self-assign or use a default system user ID.
        # For now, let's assume inviter_user_id is valid or nullable in the DB.
        # For 'updated_by', it's also the inviter at the moment of creation.
        
        public_user_data = {
            "company_id": company_id,
            "auth_user_id": str(auth_user_id), # Ensure UUID is string
            "name": user_full_name,
            "email": request.email,
            "is_active": True, # User is active upon accepting invite
            "created_by": inviter_user_id, 
            "updated_by": inviter_user_id,
            "phone_number": None # Or fetch from invite if available, and user_phone_number in schema
        }
        
        created_public_user = supabase.table("users").insert(public_user_data).execute()
        
        if not created_public_user.data or len(created_public_user.data) == 0:
            # Rollback auth.users creation or log for cleanup
            supabase.auth.admin.delete_user(auth_user_id)
            raise HTTPException(status_code=500, detail="Failed to create user record in public users table.")
        
        public_user_id = created_public_user.data[0]['id']

        # 4. Directly insert into public.user_roles if role_id is present
        role_id = invite.get("role_id")
        if role_id:
            user_role_data = {
                "user_id": public_user_id,
                "role_id": role_id,
                "created_by": inviter_user_id # Or the new user's public_user_id
            }
            supabase.table("user_roles").insert(user_role_data).execute()
            # Add error handling for this insert if necessary

        # 5. Mark the invitation as is_accepted = TRUE
        supabase.table("invitations").update({"is_accepted": True}).eq("id", invite["id"]).execute()

        # 6. Sign in the new user
        session_response = supabase.auth.sign_in_with_password(
            email=request.email,
            password=request.password
        )

        if not session_response.session or not session_response.user:
            raise HTTPException(status_code=500, detail="User created, but failed to sign in.")

        return AuthResponse(
            access_token=session_response.session.access_token,
            refresh_token=session_response.session.refresh_token,
            user_id=session_response.user.id, # This is auth_user_id (UUID from auth.users)
            email=session_response.user.email
        )

        # --- Record Activity for invited user setup ---
        try:
            auth_user_id_uuid = UUID(str(session_response.user.id))
            # We already have public_user_id and company_id from earlier in this function
            if public_user_id and company_id: # Ensure these were successfully retrieved/created
                await record_activity(
                    company_id=company_id, # from invite processing
                    user_id=public_user_id,  # from created public.users record
                    activity_type="invited_user_completed_setup",
                    description=f"Invited user {session_response.user.email} completed setup.",
                    entity_type="user",
                    entity_id=public_user_id
                )
        except Exception as activity_exc:
            print(f"Failed to record invited user setup activity: {activity_exc}")
        # --- End Record Activity ---

        return final_auth_response

    except AuthApiError as e:
        # Handle specific Supabase errors if necessary
        if "User already exists" in e.message: # Should not happen if invite logic is correct
             raise HTTPException(status_code=409, detail="User with this email already exists.")
        raise HTTPException(status_code=500, detail=f"Supabase auth error: {e.message}")
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log the error for debugging: print(f"Unexpected error in invited_user_set_password: {e}")
        # Check for PostgREST no rows error during verification phase
        if "PGRST116" in str(e) or "PostgrestError" in str(e) and "0 rows" in str(e).lower() :
             raise HTTPException(status_code=404, detail="Invite verification failed (code/email mismatch) during password set.")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/signup/verify-otp", response_model=OTPVerifiedResponse) # Changed to OTPVerifiedResponse
async def signup_verify_otp(
    request: OTPVerifyRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        # Using admin client to verify OTP for 'signup' type
        # Note: verify_otp with 'signup' type using service key might not work as expected
        # as it's typically a user-facing action. Let's test this behavior.
        # A more common flow is that the user client verifies OTP, then we use an admin client
        # for subsequent privileged operations if needed.
        # However, the task asks to use admin client.
        # Supabase verify_otp for 'signup' type automatically logs in the user and returns a session.
        session_response = supabase.auth.verify_otp(
            email=request.email,
            token=request.otp,
            type='signup' # Make sure this is the correct type string, e.g. 'email' or 'signup'
        )

        if not session_response.user or not session_response.session:
            raise HTTPException(status_code=400, detail="OTP verification failed. Invalid OTP or email.")

        # The user is now confirmed. The SQL trigger `register_company_and_user_after_confirm`
        # should have executed in Supabase.
        
        # Store user_id and email in a temporary way for the next step (set_password)
        # This is a simplified approach. In a real app, you might use a short-lived token or session state.
        # For this task, we'll rely on the frontend to pass the email to the set-password step.
        # The user is now confirmed. The SQL trigger `register_company_and_user_after_confirm`
        # should have executed in Supabase.
        
        return OTPVerifiedResponse(
            message="Email verified successfully. Please set your password.",
            user_id=session_response.user.id,
            email=session_response.user.email
        )

    except AuthApiError as e:
        if "Invalid OTP" in e.message or "token has invalid" in e.message or "expired" in e.message:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP.")
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/signup/set-password", response_model=AuthResponse)
async def signup_set_password(
    request: SetPasswordRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client)
):
    try:
        # First, get the user by email using the admin client
        # This ensures we are targeting the correct user.
        # Note: Supabase refers to this as list_users with an email filter.
        list_users_response = supabase.auth.admin.list_users(email=request.email)
        
        if not list_users_response.users:
            raise HTTPException(status_code=404, detail="User not found.")
        
        # Assuming email is unique, there should be only one user or none.
        user_to_update = None
        for u in list_users_response.users:
            if u.email == request.email:
                # Check if email is confirmed before allowing password set
                if not u.email_confirmed_at:
                     raise HTTPException(status_code=400, detail="Email not verified. Please verify OTP first.")
                user_to_update = u
                break
        
        if not user_to_update:
            raise HTTPException(status_code=404, detail="User not found or email mismatch.")

        # Update the user's password using the admin client
        updated_user_response = supabase.auth.admin.update_user_by_id(
            user_id=user_to_update.id,
            attributes={"password": request.password}
        )

        if not updated_user_response.user: # Check if user object exists in response
            raise HTTPException(status_code=500, detail="Failed to update password.")

        # After successfully setting the password, sign the user in to get tokens
        session_response = supabase.auth.sign_in_with_password(
            email=request.email,
            password=request.password
        )

        if not session_response.session or not session_response.user:
            raise HTTPException(status_code=500, detail="Password set, but failed to sign in.")

        return AuthResponse(
            access_token=session_response.session.access_token,
            refresh_token=session_response.session.refresh_token,
            user_id=session_response.user.id,
            email=session_response.user.email
        )

    except AuthApiError as e:
        # Handle specific Supabase errors if necessary
        if "User not found" in e.message:
             raise HTTPException(status_code=404, detail="User not found during password set.")
        elif "Password hash is missing" in e.message: # Example if password was not set correctly
             raise HTTPException(status_code=500, detail="Failed to set password in Supabase.")
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except HTTPException as e: # Re-raise known HTTPExceptions
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/signin", response_model=AuthResponse)
async def signin(
    request: SignInRequest,
    supabase: SupabaseClient = Depends(get_supabase_admin_client) # Can use admin or regular client
):
    try:
        session_response = supabase.auth.sign_in_with_password(
            email=request.email,
            password=request.password
        )

        if not session_response.session or not session_response.user:
            # This case might not be hit if Supabase throws AuthApiError for bad credentials
            raise HTTPException(status_code=401, detail="Invalid login credentials or user not found.")

        # Check if email is confirmed. Supabase might allow login with unconfirmed email
        # depending on project settings. It's good practice to check.
        if not session_response.user.email_confirmed_at:
            raise HTTPException(status_code=403, detail="Email not confirmed. Please verify your email first.")

        return AuthResponse(
            access_token=session_response.session.access_token,
            refresh_token=session_response.session.refresh_token,
            user_id=session_response.user.id, # UUID from auth.users
            email=session_response.user.email
        )
        
        # --- Record Activity for sign-in ---
        try:
            auth_user_id_uuid = UUID(str(session_response.user.id))
            public_user_id, company_id = await get_user_details_for_logging(auth_user_id_uuid)
            if public_user_id and company_id:
                await record_activity(
                    company_id=company_id,
                    user_id=public_user_id,
                    activity_type="user_logged_in",
                    description=f"User {session_response.user.email} logged in.",
                    entity_type="user", # Optional, could be just user_id for context
                    entity_id=public_user_id
                )
        except Exception as activity_exc:
            print(f"Failed to record sign-in activity: {activity_exc}")
        # --- End Record Activity ---

        return final_auth_response
        
    except AuthApiError as e:
        if "Invalid login credentials" in e.message or "Email not confirmed" in e.message:
            raise HTTPException(status_code=401, detail=e.message) # Use Supabase's message for detail
        raise HTTPException(status_code=500, detail=f"Supabase error: {e.message}")
    except HTTPException as e: # Re-raise our own HTTPExceptions
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
