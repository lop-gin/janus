"use client";

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner'; // For Suspense fallback

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

function SetNewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');

    if (emailParam && otpParam) {
      setEmail(emailParam);
      setOtp(otpParam);
    } else {
      setError("Missing email or OTP from previous step. Please try the process again.");
      // router.replace('/forgot-password'); // Optionally redirect
    }
    setPageLoading(false);
  }, [searchParams, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !otp) {
        setError("Email or OTP is missing. Cannot proceed.");
        return;
    }
    if (!validateForm()) {
      setError("Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password/set-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await response.json(); // Expects MessageResponse

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to set new password. Please try again.');
      }
      
      setMessage(data.message + " Redirecting to sign-in...");
      setTimeout(() => {
        router.push('/signin'); 
      }, 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return <Spinner className="mt-20" size="lg" />;
  }

  if (!email || !otp) {
    return (
        <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Invalid page access. Email or OTP missing."}</p>
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
        Set Your New Password
      </h2>
      <p className="text-center text-gray-400 mb-8">
        OTP verified for <strong className="text-orange-400">{email}</strong>. <br/> Please enter and confirm your new password.
      </p>

      {error && <p className="mb-4 text-sm text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
      {message && <p className="mb-4 text-sm text-center text-green-400 bg-green-900/30 p-3 rounded-md">{message}</p>}


      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="New Password"
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (formErrors.password) setFormErrors(prev => ({...prev, password: ''}));
            setMessage(null); setError(null);
          }}
          error={formErrors.password}
          placeholder="Enter your new password"
          required
          aria-describedby="password-requirements"
          disabled={isLoading || !!message}
        />
        <p id="password-requirements" className="text-xs text-gray-400 mt-[-1rem] mb-2 px-1">Must be at least 8 characters long.</p>

        <Input
          label="Confirm New Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (formErrors.confirmPassword) setFormErrors(prev => ({...prev, confirmPassword: ''}));
            setMessage(null); setError(null);
          }}
          error={formErrors.confirmPassword}
          placeholder="Confirm your new password"
          required
          disabled={isLoading || !!message}
        />
        
        <Button type="submit" fullWidth variant="primary" isLoading={isLoading} disabled={isLoading || !!message}>
          Set New Password and Proceed to Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Remembered your password after all?{' '}
        <Link href="/signin" legacyBehavior>
          <a className="font-medium text-orange-500 hover:text-orange-400">
            Sign In
          </a>
        </Link>
      </p>
    </>
  );
}

export default function SetNewPasswordPage() {
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
                        <SetNewPasswordContent />
                    </Suspense>
                </div>
            </div>
            <footer className="py-10 text-center text-gray-500 mt-10">
                <p className="text-sm">&copy; {new Date().getFullYear()} Recordserp. All rights reserved.</p>
            </footer>
        </div>
    );
}
