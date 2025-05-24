"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpContext } from '@/context/SignUpContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link'; // For fallback navigation if needed

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

export default function SetPasswordPage() {
  const router = useRouter();
  const { 
    verifiedEmail, 
    userId, // From OTP verification response
    submitSetPassword, 
    isLoading, 
    error: contextError,
    resetContext, // To clear context on leaving or manual navigation
  } = useSignUpContext();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Redirect if verifiedEmail or userId is not set (e.g. direct navigation)
  useEffect(() => {
    if (!verifiedEmail || !userId) {
      // A more sophisticated check might try to determine the last valid step
      // For now, redirect to the beginning of the signup or verify email step.
      resetContext(); // Clear potentially inconsistent state
      router.replace('/signup/verify-email'); 
    }
  }, [verifiedEmail, userId, router, resetContext]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    // Add more password complexity rules here if needed (e.g., uppercase, number, symbol)

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
    setLocalError(null);
    if (validateForm()) {
      // submitSetPassword is part of the context and handles API call + navigation + context reset
      await submitSetPassword(password); 
    } else {
      setLocalError("Please correct the errors in the form.");
    }
  };

  return (
    <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-4">
        Step 4: Set Your Password
      </h2>
      <p className="text-center text-gray-300 mb-8">
        Your email <strong className="text-orange-400">{verifiedEmail || "has been verified"}</strong>! Now, create a secure password.
      </p>
      
      {contextError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{contextError}</p>}
      {localError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{localError}</p>}

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
          Complete Sign-Up & Log In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Changed your mind?{' '}
        <Link href="/" className="font-medium text-orange-500 hover:text-orange-400" onClick={() => resetContext()}>
          Go to Homepage
        </Link>
      </p>
    </div>
  );
}
