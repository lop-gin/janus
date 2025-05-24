"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      setError("Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Sign-in failed. Please check your credentials.');
      }

      // Store tokens and user info
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('currentUser', JSON.stringify({ userId: data.user_id, email: data.email }));
      
      // Redirect to dashboard (or a placeholder if dashboard doesn't exist yet)
      router.push('/dashboard'); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-gray-100 font-sans p-4">
      <div className="w-full max-w-md">
        {/* Logo or App Name */}
        <div className="text-center mb-10">
          <Link href="/" legacyBehavior>
            <a className="text-5xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
              Recordserp
            </a>
          </Link>
        </div>

        <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full animate-fadeIn">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">
            Sign In to Your Account
          </h2>

          {error && <p className="mb-4 text-sm text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if(formErrors.email) setFormErrors(prev => ({...prev, email: undefined}));
              }}
              error={formErrors.email}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if(formErrors.password) setFormErrors(prev => ({...prev, password: undefined}));
              }}
              error={formErrors.password}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            
            <div className="text-right text-sm">
              <Link href="/forgot-password" legacyBehavior>
                <a className="font-medium text-orange-500 hover:text-orange-400">
                  Forgot Password?
                </a>
              </Link>
            </div>

            <Button type="submit" fullWidth variant="primary" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don’t have an account?{' '}
            <Link href="/signup/company-details" legacyBehavior>
              <a className="font-medium text-orange-500 hover:text-orange-400">
                Sign Up
              </a>
            </Link>
          </p>
           {/* Placeholder for "Invited? Sign in with code" - to be implemented in Step 9
           <p className="mt-2 text-center text-sm text-gray-400">
            Invited to a company?{' '}
            <Link href="/signin-invited" legacyBehavior>
              <a className="font-medium text-orange-500 hover:text-orange-400">
                Sign in with invite code
              </a>
            </Link>
          </p>
          */}
        </div>
      </div>
       {/* Simple Footer */}
       <footer className="py-10 text-center text-gray-500 mt-10">
          <p className="text-sm">&copy; {new Date().getFullYear()} Recordserp. All rights reserved.</p>
        </footer>
    </div>
  );
}
