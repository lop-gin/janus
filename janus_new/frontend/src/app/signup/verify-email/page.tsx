"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpContext } from '@/context/SignUpContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { 
    verifiedEmail, 
    otp, 
    setOtp, 
    submitOtpVerification, 
    isLoading, 
    error: contextError,
    submitSignUpInitiate, // For resend, though not fully implemented here
    userDetails, // Needed if resend was to be implemented fully
    companyDetails, // Needed if resend was to be implemented fully
  } = useSignUpContext();
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Redirect if email for verification is not set (e.g. direct navigation)
  useEffect(() => {
    if (!verifiedEmail) {
      // Try to see if user details exist to redirect appropriately
      if (userDetails.email) {
        router.replace('/signup/user-details');
      } else if (companyDetails.name) {
        router.replace('/signup/company-details');
      } else {
        router.replace('/signup/company-details'); // Fallback
      }
    }
  }, [verifiedEmail, router, userDetails, companyDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtp = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(newOtp);
    if (otpError) {
      setOtpError(undefined);
    }
  };

  const validateOtp = (): boolean => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP.");
      return false;
    }
    setOtpError(undefined);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (validateOtp()) {
      await submitOtpVerification();
    } else {
      setLocalError("Please correct the errors in the form.");
    }
  };
  
  // Basic Resend OTP - does not handle timers or complex UI states
  const handleResendOtp = async () => {
    setIsResending(true);
    setResendMessage(null);
    setLocalError(null);
    try {
      // Re-call the initiate step to trigger a new OTP.
      // This assumes the backend will resend OTP if user exists but is unconfirmed.
      // A dedicated resend endpoint would be more robust.
      await submitSignUpInitiate(); 
      setResendMessage("A new OTP has been sent to your email.");
    } catch (err: any) {
      setLocalError(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-4">
        Step 3: Verify Your Email
      </h2>
      <p className="text-center text-gray-300 mb-8">
        A 6-digit code has been sent to <strong className="text-orange-400">{verifiedEmail || "your email"}</strong>.
        Please enter it below.
      </p>
      
      {contextError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{contextError}</p>}
      {localError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{localError}</p>}
      {resendMessage && <p className="mb-4 text-sm text-green-400 bg-green-900/30 p-3 rounded-md">{resendMessage}</p>}


      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Verification Code (OTP)"
          id="otp"
          name="otp"
          type="text" // Allows for easier handling of input length and characters
          value={otp}
          onChange={handleChange}
          error={otpError}
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
          inputMode="numeric"
          autoComplete="one-time-code"
        />
        
        <Button type="submit" fullWidth variant="primary" isLoading={isLoading}>
          Verify Code
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Button 
            variant="ghost" 
            onClick={handleResendOtp} 
            isLoading={isResending}
            disabled={isLoading || isResending}
        >
            {isResending ? "Resending..." : "Resend Code"}
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-400">
        Need to change your details? Go back to{' '}
        <Link href="/signup/user-details" className="font-medium text-orange-500 hover:text-orange-400">
          User Details
        </Link>.
      </p>
    </div>
  );
}
