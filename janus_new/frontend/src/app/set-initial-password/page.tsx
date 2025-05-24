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

function SetInitialPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [pageLoading, setPageLoading] = useState(true);


  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');

    if (emailParam && codeParam) {
      setEmail(emailParam);
      setCode(codeParam);
    } else {
      setError("Missing email or code in URL. Please verify your invite again.");
      // Optional: redirect after a delay or provide a button
      // router.replace('/verify-invite');
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
    if (!email || !code) {
        setError("Email or code is missing. Cannot proceed.");
        return;
    }
    if (!validateForm()) {
      setError("Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/invited-user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await response.json(); // Expects AuthResponse

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to set password. Please try again.');
      }

      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('currentUser', JSON.stringify({ userId: data.user_id, email: data.email }));
      
      router.push('/dashboard'); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (pageLoading) {
    return <Spinner className="mt-20" size="lg" />;
  }

  if (!email || !code) {
    return (
        <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Invalid page access. Email or code missing."}</p>
            <Link href="/verify-invite" legacyBehavior>
                <a className="text-orange-500 hover:text-orange-400">
                    Please verify your invite code again.
                </a>
            </Link>
        </div>
    );
  }

  return (
    <>
      <h2 className="text-3xl font-bold text-center text-gray-100 mb-4">
        Set Your Initial Password
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Welcome! Your invite for <strong className="text-orange-400">{email}</strong> is verified. <br/> Please create a secure password to continue.
      </p>

      {error && <p className="mb-4 text-sm text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}

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
          }}
          error={formErrors.password}
          placeholder="Enter your new password"
          required
          aria-describedby="password-requirements"
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
          }}
          error={formErrors.confirmPassword}
          placeholder="Confirm your new password"
          required
        />
        
        <Button type="submit" fullWidth variant="primary" isLoading={isLoading}>
          Set Password and Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Something wrong?{' '}
        <Link href="/verify-invite" legacyBehavior>
          <a className="font-medium text-orange-500 hover:text-orange-400">
            Try verifying your invite again.
          </a>
        </Link>
      </p>
    </>
  );
}


export default function SetInitialPasswordPage() {
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
                        <SetInitialPasswordContent />
                    </Suspense>
                </div>
            </div>
            <footer className="py-10 text-center text-gray-500 mt-10">
                <p className="text-sm">&copy; {new Date().getFullYear()} Recordserp. All rights reserved.</p>
            </footer>
        </div>
    );
}
