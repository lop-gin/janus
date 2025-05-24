"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpContext } from '@/context/SignUpContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface FormErrors {
  full_name?: string;
  email?: string;
  user_phone_number?: string;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const { 
    userDetails, 
    updateUserDetails, 
    submitSignUpInitiate, 
    isLoading, 
    error: contextError 
  } = useSignUpContext();
  
  const [localError, setLocalError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Redirect if company details are not filled (e.g. direct navigation)
  // This is a basic check. A more robust solution might involve checking specific required fields.
  useEffect(() => {
    const { companyDetails } = useSignUpContext(); // Get fresh context
    if (!companyDetails.name || !companyDetails.type) {
      router.replace('/signup/company-details');
    }
  }, [router]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateUserDetails({ [name]: value });
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!userDetails.full_name.trim()) {
      newErrors.full_name = "Your full name is required.";
    }
    if (!userDetails.email.trim()) {
      newErrors.email = "Your email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(userDetails.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    // Optional: Add phone number validation if needed, e.g., format.
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear local error
    if (validateForm()) {
      // submitSignUpInitiate is already part of the context and handles API call + navigation
      await submitSignUpInitiate(); 
    } else {
      setLocalError("Please correct the errors in the form.");
    }
  };

  return (
    <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-8">
        Step 2: Your Admin User Details
      </h2>
      
      {contextError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{contextError}</p>}
      {localError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{localError}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          id="full_name"
          name="full_name"
          value={userDetails.full_name}
          onChange={handleChange}
          error={formErrors.full_name}
          placeholder="John Doe"
          required
        />
        <Input
          label="Login Email"
          id="email"
          name="email"
          type="email"
          value={userDetails.email}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="you@example.com"
          required
          aria-describedby="email-description"
        />
        <p id="email-description" className="text-xs text-gray-400 mt-[-1rem] mb-2 px-1">This will be your primary login email and where we send verification codes.</p>

        <Input
          label="Phone Number (Optional)"
          id="user_phone_number"
          name="user_phone_number"
          type="tel"
          value={userDetails.user_phone_number || ''}
          onChange={handleChange}
          error={formErrors.user_phone_number}
          placeholder="+1 (555) 123-4567"
        />
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => router.push('/signup/company-details')}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Back to Company Details
          </Button>
          <Button 
            type="submit" 
            fullWidth 
            variant="primary" 
            isLoading={isLoading}
            className="w-full sm:w-auto flex-grow"
          >
            Continue to Verify Email
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-orange-500 hover:text-orange-400">
          Sign In
        </Link>
      </p>
    </div>
  );
}
