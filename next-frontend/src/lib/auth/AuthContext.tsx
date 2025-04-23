// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

type Role = {
  id: number;
  role_name: string;
  description: string | null;
  permissions: Record<string, string[] | boolean>;
  is_system_role: boolean;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  roles: Role[];
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
  hasPermission: (module: string, action: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRoles(session.user.id);
        }
      }
      
      setIsLoading(false);
    };

    const fetchRoles = async (authUserId: string) => {
      // Get numeric user_id from users table using auth_user_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user ID:', userError);
        return;
      }

      const numericUserId = userData.id; // Numeric ID

      // Fetch roles using numeric user_id
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('roles!inner(id, role_name, description, permissions, is_system_role)')
        .eq('user_id', numericUserId);

      if (error) {
        console.error('Error fetching roles:', error);
      } else {
        setRoles(
          userRoles?.map(ur => ({
            id: ur.roles.id,
            role_name: ur.roles.role_name,
            description: ur.roles.description,
            permissions: ur.roles.permissions as Record<string, string[] | boolean>,
            is_system_role: ur.roles.is_system_role ?? false, // Default null to false
          })) || []
        );
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchRoles(session.user.id);
        } else {
          setRoles([]);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasPermission = (module: string, action: string): boolean => {
    return roles.some(role => {
      if (role.permissions["all_modules"] === true) return true;
      const modulePermissions = role.permissions[module];
      return modulePermissions && Array.isArray(modulePermissions) && modulePermissions.includes(action);
    });
  };

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
        toast.success('Please check your email for the verification link.');
        router.push('/auth/check-email');
      } else {
        throw new Error('No user returned after signup');
      }
    } catch (error: any) {
      console.error('Sign-up error:', error);
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
    roles,
    isLoading,
    signUp,
    signIn,
    signOut,
    hasPermission,
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