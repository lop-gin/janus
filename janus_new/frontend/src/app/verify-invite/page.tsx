"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormErrors {
  email?: string;
  code?: string;
}

export default function VerifyInvitePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
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
    if (!code.trim()) {
      newErrors.code = "Invite code is required.";
    } else if (code.trim().length < 6 || code.trim().length > 10) {
      newErrors.code = "Invite code must be between 6 and 10 characters.";
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
      const response = await fetch('/api/v1/auth/verify-invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json(); // Expects InviteVerificationResponse

      if (!response.ok) {
        throw new Error(data.detail || 'Invite verification failed. Please check your details.');
      }

      // On success, navigate to set initial password page, passing email and code
      // These will be used to re-verify and set password
      router.push(`/set-initial-password?email=${encodeURIComponent(data.email)}&code=${encodeURIComponent(data.code)}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">
            Verify Your Invitation
          </h2>
          <p className="text-center text-gray-400 mb-6">
            Enter your email and the invite code you received.
          </p>

          {error && <p className="mb-4 text-sm text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Your Email Address"
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
              label="Invite Code"
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.trim());
                if(formErrors.code) setFormErrors(prev => ({...prev, code: undefined}));
              }}
              error={formErrors.code}
              placeholder="Enter your 6-10 digit code"
              required
              minLength={6}
              maxLength={10}
            />
            
            <Button type="submit" fullWidth variant="primary" isLoading={isLoading}>
              Verify Invite
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" legacyBehavior>
              <a className="font-medium text-orange-500 hover:text-orange-400">
                Sign In
              </a>
            </Link>
          </p>
           <p className="mt-2 text-center text-sm text-gray-400">
            Want to create a new company account?{' '}
            <Link href="/signup/company-details" legacyBehavior>
              <a className="font-medium text-orange-500 hover:text-orange-400">
                Sign Up
              </a>
            </Link>
          </p>
        </div>
      </div>
      <footer className="py-10 text-center text-gray-500 mt-10">
        <p className="text-sm">&copy; {new Date().getFullYear()} Recordserp. All rights reserved.</p>
      </footer>
    </div>
  );
}
