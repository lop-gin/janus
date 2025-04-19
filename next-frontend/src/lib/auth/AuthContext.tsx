// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { 
    full_name?: string;
    company_name?: string;
    company_type?: string;
    phone?: string;
    address?: string;
    is_superadmin?: boolean;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get session from storage
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: { 
    full_name?: string;
    company_name?: string;
    company_type?: string;
    phone?: string;
    address?: string;
    is_superadmin?: boolean;
  }) => {
    setIsLoading(true); // Set loading state to true while processing
    
    try {
      // Sign up the user with Supabase Auth
      // The metadata (full_name, company_name, etc.) is stored in auth.users.raw_user_meta_data
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name,
            company_name: metadata?.company_name,
            company_type: metadata?.company_type,
            phone: metadata?.phone,
            address: metadata?.address,
          }
        }
      });
  
      if (error) {
        // If Supabase Auth returns an error (e.g., email already exists), log it and throw it
        console.error('Auth signup error:', error);
        throw error;
      }
  
      if (data.user) {
        // Since autoConfirm=false in Supabase (assumed default behavior), there’s no session yet
        // The user must confirm their email via a verification link
        // We no longer call the RPC function here; this is now handled by a trigger after confirmation
        toast.success('Please check your email for the verification link.'); // Notify user to check email
        router.push('/auth/check-email'); // Redirect to the new "Check Your Email" page
      } else {
        // If no user object is returned, something went wrong with signup
        throw new Error('No user returned after signup');
      }
    } catch (error: any) {
      // Catch any errors (from Supabase or custom), log them, and show a toast notification
      console.error('Sign-up error:', error);
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false); // Reset loading state regardless of success or failure
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}