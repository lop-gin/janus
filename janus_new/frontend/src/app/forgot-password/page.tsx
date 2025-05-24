"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormErrors {
  email?: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!validateForm()) {
      setError("Please correct the errors in the form.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/forgot-password/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json(); // Expects MessageResponse

      if (!response.ok) {
        // Even if backend doesn't error for non-existent user,
        // other errors (like server down) should be caught.
        throw new Error(data.detail || 'Failed to initiate password reset.');
      }
      
      setMessage(data.message); // "If an account with this email exists..."
      // Do not clear email field here, user might want to see it
      // router.push(`/reset-password/verify?email=${encodeURIComponent(email)}`);
      // Instead of immediate navigation, show the message.
      // The user will receive an email with OTP. The next step page can be linked from here or user navigates manually.
      // For a smoother flow, we can navigate after a delay or with a button.
      // Let's navigate to OTP entry page after showing the message.
      // The backend sends the OTP, so user needs to go to the verify page.
      setTimeout(() => {
        router.push(`/reset-password/verify?email=${encodeURIComponent(email)}`);
      }, 3000); // Navigate after 3 seconds

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
            Forgot Your Password?
          </h2>
          <p className="text-center text-gray-400 mb-6">
            No worries! Enter your email address below, and if an account exists, we'll send you an OTP to reset your password.
          </p>

          {error && <p className="mb-4 text-sm text-center text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
          {message && <p className="mb-4 text-sm text-center text-green-400 bg-green-900/30 p-3 rounded-md">{message}</p>}


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
                setMessage(null); // Clear message on new input
                setError(null);  // Clear error on new input
              }}
              error={formErrors.email}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isLoading || !!message} // Disable if loading or success message shown
            />
            
            <Button type="submit" fullWidth variant="primary" isLoading={isLoading} disabled={isLoading || !!message}>
              {isLoading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>

          {message && (
            <div className="mt-6 text-center">
                <Button onClick={() => router.push(`/reset-password/verify?email=${encodeURIComponent(email)}`)} variant="secondary">
                    Proceed to Verify OTP
                </Button>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-400">
            Remember your password?{' '}
            <Link href="/signin" legacyBehavior>
              <a className="font-medium text-orange-500 hover:text-orange-400">
                Sign In
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
