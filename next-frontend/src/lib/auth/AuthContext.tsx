'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"

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
    is_admin?: boolean;
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
    is_admin?: boolean;
  }) => {
    setIsLoading(true);
    
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });
  
      if (error) {
        console.error('Auth signup error:', error);
        throw error;
      }
  
      // If successful and we have a user, create company and user records
      if (data.user) {
        try {
          // Create company record
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert([{ 
              name: metadata?.company_name || 'Default Company',
              email: email,
              phone: metadata?.phone || '',
              address: metadata?.address || '',
              company_type: metadata?.company_type || 'manufacturer'
            }])
            .select();
  
          if (companyError) {
            console.error('Company creation error:', companyError);
            toast.error('Error creating company record');
          } else {
            console.log('Company created successfully:', companyData);
            
            // Create user record with company_id if company was created
            if (companyData && companyData.length > 0) {
              const companyId = companyData[0].id;
              
              const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([{
                  company_id: companyId,
                  name: metadata?.full_name || 'User',
                  email: email,
                  password_hash: 'managed_by_supabase',
                  is_active: true,
                  created_by: null,
                  updated_by: null
                }])
                .select();
  
              if (userError) {
                console.error('User record creation error:', userError);
                toast.error('Error creating user record');
              } else {
                console.log('User record created successfully:', userData);
              }
            }
          }
        } catch (dbError) {
          console.error('Database operation error:', dbError);
          toast.error('Error during account setup');
        }
  
        // Automatically sign in the user after registration
        try {
          await signIn(email, password);
        } catch (signInError) {
          console.error('Auto sign-in error:', signInError);
          router.push('/auth/login');
        }
      }
    } catch (error) {
      console.error('Error signing up:', error);
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
