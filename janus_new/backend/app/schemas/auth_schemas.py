from typing import Optional, Literal
from uuid import UUID
from pydantic import BaseModel, EmailStr, constr

class CompanyDetails(BaseModel):
    name: str
    type: Literal['manufacturer', 'distributor', 'both'] = 'manufacturer'
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None

class UserDetails(BaseModel):
    full_name: str
    email: EmailStr
    user_phone_number: Optional[str] = None # Changed from phone_number to match DB trigger

class SignUpInitiateRequest(BaseModel):
    company: CompanyDetails
    user: UserDetails

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: constr(min_length=6, max_length=6)

class SetPasswordRequest(BaseModel):
    email: EmailStr # Required to identify the user for password update via admin client
    password: constr(min_length=8) # Enforce min_length

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: UUID
    email: EmailStr

class OTPVerifiedResponse(BaseModel):
    message: str
    user_id: UUID
    email: EmailStr
    # Optionally, could include a short-lived token here if not relying on frontend to pass email/ID

class MessageResponse(BaseModel):
    message: str

class SignInRequest(BaseModel):
    email: EmailStr
    password: str

# Schemas for Invited User Flow
class InviteVerifyRequest(BaseModel):
    email: EmailStr
    code: constr(min_length=6, max_length=10)

class InviteVerificationResponse(BaseModel):
    message: str
    email: EmailStr
    code: str # Carry forward the verified code

class InvitedUserSetPasswordRequest(BaseModel):
    email: EmailStr
    code: str # From InviteVerificationResponse
    password: constr(min_length=8)

# Schemas for Forgot Password Flow
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# OTPVerifyRequest (from auth_schemas.py) can be reused for ResetPasswordVerifyOTPRequest
# It has: email: EmailStr, otp: constr(min_length=6, max_length=6)
# OTPVerifiedResponse (from auth_schemas.py) can be reused for ResetPasswordVerifyOTPResponse
# It has: message: str, user_id: UUID, email: EmailStr (user_id might not be relevant here, but email is)
# For consistency with the task, let's ensure OTPVerifiedResponse carries the OTP/token if needed for the next step.
# The current OTPVerifiedResponse returns user_id and email.
# Let's make a specific response or ensure the OTP is passed correctly.
# The task specifies OTPVerifiedResponse should return (email, message, and the OTP itself as `code` or `token` field)
# My current OTPVerifiedResponse returns: message: str, user_id: UUID, email: EmailStr
# I will adjust OTPVerifiedResponse or create a new one.
# Given OTPVerifiedResponse is used by signup, let's create a new one for password reset to avoid confusion.

class ResetOTPVerifiedResponse(BaseModel):
    message: str
    email: EmailStr
    otp: str # Carry forward the verified OTP

class SetNewPasswordRequest(BaseModel):
    email: EmailStr
    otp: str # The OTP received and verified
    password: constr(min_length=8)
