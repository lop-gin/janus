"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define the shapes of our data
interface CompanyDetails {
  name: string;
  type: 'manufacturer' | 'distributor' | 'both' | '';
  email?: string;
  address?: string;
  tax_id?: string;
}

interface UserDetails {
  full_name: string;
  email: string; // Primary login email
  user_phone_number?: string;
}

interface SignUpState {
  companyDetails: CompanyDetails;
  userDetails: UserDetails;
  otp: string;
  // We'll store the email used for OTP verification separately
  // as it's crucial for subsequent steps and comes from userDetails.email initially.
  // It's also returned by the /verify-otp endpoint.
  verifiedEmail?: string; 
  userId?: string; // From OTP verification response
}

interface SignUpContextType extends SignUpState {
  updateCompanyDetails: (details: Partial<CompanyDetails>) => void;
  updateUserDetails: (details: Partial<UserDetails>) => void;
  setOtp: (otp: string) => void;
  setVerifiedEmail: (email: string) => void;
  setUserId: (userId: string) => void;
  submitSignUpInitiate: () => Promise<void>;
  submitOtpVerification: () => Promise<void>;
  submitSetPassword: (password: string) => Promise<void>;
  resetContext: () => void;
  isLoading: boolean;
  error: string | null;
}

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

const initialState: SignUpState = {
  companyDetails: {
    name: '',
    type: '',
    email: '',
    address: '',
    tax_id: '',
  },
  userDetails: {
    full_name: '',
    email: '',
    user_phone_number: '',
  },
  otp: '',
  verifiedEmail: undefined,
  userId: undefined,
};

export const SignUpProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SignUpState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateCompanyDetails = (details: Partial<CompanyDetails>) => {
    setState((prev) => ({ ...prev, companyDetails: { ...prev.companyDetails, ...details } }));
  };

  const updateUserDetails = (details: Partial<UserDetails>) => {
    setState((prev) => ({ ...prev, userDetails: { ...prev.userDetails, ...details } }));
     // If the primary user email is being updated, also update verifiedEmail for consistency until OTP step
    if (details.email) {
      setVerifiedEmail(details.email);
    }
  };

  const setOtp = (otp: string) => {
    setState((prev) => ({ ...prev, otp }));
  };
  
  const setVerifiedEmail = (email: string) => {
    setState(prev => ({ ...prev, verifiedEmail: email }));
  };

  const setUserId = (userId: string) => {
    setState(prev => ({ ...prev, userId: userId }));
  };

  const resetContext = () => {
    setState(initialState);
    setError(null);
    setIsLoading(false);
  };

  const submitSignUpInitiate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/signup/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: state.companyDetails,
          user: state.userDetails,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to initiate sign up.');
      }
      // Backend sends OTP automatically. Frontend navigates to OTP step.
      // Store the email that was used for initiation, as it's needed for OTP verification.
      setVerifiedEmail(state.userDetails.email); 
      router.push('/signup/verify-email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitOtpVerification = async () => {
    if (!state.verifiedEmail) {
      setError("Email for verification is not set.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/signup/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.verifiedEmail, otp: state.otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed.');
      }
      // Assuming data = { message: string, user_id: UUID, email: EmailStr }
      setUserId(data.user_id); // Store user_id from response
      setVerifiedEmail(data.email); // Confirm/update verified email from response
      router.push('/signup/set-password');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitSetPassword = async (password: string) => {
    if (!state.verifiedEmail) { // Use verifiedEmail from context
        setError("Verified email not found. Please complete OTP verification.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/auth/signup/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.verifiedEmail, password }),
      });
      const data = await response.json(); // AuthResponse: access_token, refresh_token, user_id, email
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to set password.');
      }
      // Store tokens (e.g., localStorage)
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('currentUser', JSON.stringify({ userId: data.user_id, email: data.email }));
      
      resetContext();
      router.push('/dashboard'); // Or landing page, or wherever appropriate
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignUpContext.Provider
      value={{
        ...state,
        updateCompanyDetails,
        updateUserDetails,
        setOtp,
        setVerifiedEmail,
        setUserId,
        submitSignUpInitiate,
        submitOtpVerification,
        submitSetPassword,
        resetContext,
        isLoading,
        error,
      }}
    >
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUpContext = () => {
  const context = useContext(SignUpContext);
  if (context === undefined) {
    throw new Error('useSignUpContext must be used within a SignUpProvider');
  }
  return context;
};
