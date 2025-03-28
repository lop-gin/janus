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
          // Using raw SQL to insert into companies table
          const companyName = metadata?.company_name || 'Default Company';
          const companyType = metadata?.company_type || 'manufacturer';
          const phone = metadata?.phone || '';
          const address = metadata?.address || '';
          
          // Simple INSERT query that returns just the ID
          const insertCompanySQL = `
            INSERT INTO companies (name, email, phone, address, company_type)
            VALUES ('${companyName}', '${email}', '${phone}', '${address}', '${companyType}')
            RETURNING id;
          `;
          
          console.log('Executing company insert SQL');
          
          const { data: companyResult, error: companyError } = await (supabase as any).rpc(
            'execute_sql', 
            { sql_query: insertCompanySQL }
          );
  
          if (companyError) {
            console.error('Company creation error (detailed):', companyError);
            toast.error(`Error creating company: ${companyError.message}`);
          } else {
            console.log('Company created successfully, result:', companyResult);
            
            // Extract company ID from the result
            const companyId = companyResult;
            
            if (companyId) {
              console.log('Company ID extracted:', companyId);
              
              // Using raw SQL to insert into users table
              const fullName = metadata?.full_name || 'User';
              
              const insertUserSQL = `
                INSERT INTO users (company_id, name, email, password_hash, is_active)
                VALUES (${companyId}, '${fullName}', '${email}', 'managed_by_supabase', true)
                RETURNING id;
              `;
              
              console.log('Executing user insert SQL');
              
              const { data: userResult, error: userError } = await (supabase as any).rpc(
                'execute_sql', 
                { sql_query: insertUserSQL }
              );
  
              if (userError) {
                console.error('User record creation error (detailed):', userError);
                toast.error(`Error creating user record: ${userError.message}`);
              } else {
                console.log('User record created successfully, result:', userResult);
                
                // Extract user ID from the result
                const userId = userResult;
                
                if (userId) {
                  console.log('User ID extracted:', userId);
                  
                  // Create Super Admin role for the company
                  const superAdminPermissions = JSON.stringify({
                    all_modules: true,
                    permissions: {
                      sales: ["view", "create", "edit", "delete"],
                      purchasing: ["view", "create", "edit", "delete"],
                      production: ["view", "create", "edit", "delete"],
                      packaging: ["view", "create", "edit", "delete"],
                      transport: ["view", "create", "edit", "delete"],
                      warehouse: ["view", "create", "edit", "delete"],
                      reports: ["view", "create", "edit", "delete"],
                      settings: ["view", "create", "edit", "delete"]
                    }
                  });
                  
                  const insertRoleSQL = `
                    INSERT INTO roles (company_id, role_name, description, permissions, is_system_role, created_by, updated_by)
                    VALUES (${companyId}, 'Super Admin', 'Company owner with full system access', '${superAdminPermissions}', true, ${userId}, ${userId})
                    RETURNING id;
                  `;
                  
                  console.log('Executing role insert SQL');
                  
                  const { data: roleResult, error: roleError } = await (supabase as any).rpc(
                    'execute_sql', 
                    { sql_query: insertRoleSQL }
                  );
                  
                  if (roleError) {
                    console.error('Role creation error (detailed):', roleError);
                    toast.error(`Error creating role: ${roleError.message}`);
                  } else {
                    console.log('Role created successfully, result:', roleResult);
                    
                    // Extract role ID from the result
                    const roleId = roleResult;
                    
                    if (roleId) {
                      console.log('Role ID extracted:', roleId);
                      
                      // Assign role to user
                      const insertUserRoleSQL = `
                        INSERT INTO user_roles (user_id, role_id, created_by)
                        VALUES (${userId}, ${roleId}, ${userId})
                        RETURNING id;
                      `;
                      
                      console.log('Executing user_role insert SQL');
                      
                      const { data: userRoleResult, error: userRoleError } = await (supabase as any).rpc(
                        'execute_sql', 
                        { sql_query: insertUserRoleSQL }
                      );
                      
                      if (userRoleError) {
                        console.error('User role assignment error (detailed):', userRoleError);
                        toast.error(`Error assigning role: ${userRoleError.message}`);
                      } else {
                        console.log('User role assigned successfully, result:', userRoleResult);
                        toast.success('Account created successfully with Super Admin role!');
                      }
                    }
                  }
                }
              }
            } else {
              console.error('Failed to get company ID from result:', companyResult);
              toast.error('Error during account setup: Could not get company ID');
            }
          }
        } catch (dbError: any) {
          console.error('Database operation error (detailed):', dbError);
          toast.error(`Error during account setup: ${dbError.message || 'Unknown error'}`);
        }
  
        // Automatically sign in the user after registration
        try {
          await signIn(email, password);
        } catch (signInError) {
          console.error('Auto sign-in error:', signInError);
          router.push('/auth/login');
        }
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(`Registration failed: ${error.message || 'Unknown error'}`);
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
