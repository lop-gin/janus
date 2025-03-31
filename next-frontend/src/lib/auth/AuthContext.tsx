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
    setIsLoading(true);
    
    try {
      // Sign up with Supabase Auth
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
        console.error('Auth signup error:', error);
        throw error;
      }
  
      if (data.user) {
        // Call RPC to create company and user records
        const { data: rpcData, error: rpcError } = await supabase.rpc('register_company_and_user', {
          p_auth_user_id: data.user.id,
          p_email: email,
          p_full_name: metadata?.full_name || '',
          p_company_name: metadata?.company_name || '',
          p_company_type: metadata?.company_type || 'manufacturer',
          p_phone: metadata?.phone || '',
          p_address: metadata?.address || ''
        });
  
        if (rpcError) {
          console.error('RPC error:', rpcError);
          throw new Error('Failed to create company and user records');
        }
  
        console.log('Registration successful:', rpcData);
        toast.success('Registration successful! Check your email to confirm your account.');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to register');
      throw error;
    } finally {
      setIsLoading(false);
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