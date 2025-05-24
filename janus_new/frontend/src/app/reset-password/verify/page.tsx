"use client";

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner'; // For Suspense fallback

function VerifyResetOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setError("Email not provided. Please start the forgot password process again.");
      // Optionally redirect: router.replace('/forgot-password');
    }
    setPageLoading(false);
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtp = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(newOtp);
    if (otpError) setOtpError(undefined);
    setError(null);
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
    setError(null);
    if (!email) {
        setError("Email is missing. Cannot verify OTP.");
        return;
    }
    if (!validateOtp()) {
      setError("Please correct the OTP error.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json(); // Expects ResetOTPVerifiedResponse { message, email, otp }

      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed. Please check the code or try again.');
      }
      
      // Backend confirms OTP and returns it. Navigate to set new password.
      router.push(`/reset-password/set-new?email=${encodeURIComponent(data.email)}&otp=${encodeURIComponent(data.otp)}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <Spinner className="mt-20" size="lg" />;
  }

  if (!email) {
    return (
        <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Invalid page access. Email missing."}</p>
            <Link href="/forgot-password" legacyBehavior>
                <a className="text-orange-500 hover:text-orange-400">
                    Start Forgot Password Process
                </a>
            </Link>
        </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-100 mb-4">
        Verify Reset Code
      </h2>
      <p className="text-center text-gray-400 mb-8">
        A 6-digit One-Time Password (OTP) has been sent to <strong className="text-orange-400">{email}</strong>.
        Please enter it below.
      </p>

      {error && <p className="mb-4 text-sm text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Verification Code (OTP)"
          id="otp"
          name="otp"
          type="text"
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
          Verify OTP
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Didn't receive the code?{' '}
        <Link href={`/forgot-password?email=${encodeURIComponent(email)}`} legacyBehavior>
          <a className="font-medium text-orange-500 hover:text-orange-400">
            Try sending again
          </a>
        </Link>
        <br/> or check your spam folder.
      </p>
    </>
  );
}


export default function VerifyResetOTPPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-gray-100 font-sans p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                <Link href="/" legacyBehavior>
                    <a className="text-5xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
                    Recordserp
                    </a>
                </Link>
                </div>
                <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full animate-fadeIn">
                    <Suspense fallback={<Spinner size="lg" />}>
                        <VerifyResetOTPContent />
                    </Suspense>
                </div>
            </div>
            <footer className="py-10 text-center text-gray-500 mt-10">
                <p className="text-sm">&copy; {new Date().getFullYear()} Recordserp. All rights reserved.</p>
            </footer>
        </div>
    );
}
