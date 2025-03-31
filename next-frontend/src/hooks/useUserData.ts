import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';

interface UserData {
  companyName: string;
  fullName: string;
  roles: string[];
}

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch user details from 'users' table
        const { data: userDetails, error: userError } = await supabase
          .from('users')
          .select('id, company_id, name')
          .eq('auth_user_id', user.id)
          .single();

        if (userError) {
          throw new Error(`User fetch error: ${userError.message}`);
        }
        if (!userDetails) {
          throw new Error('No user found in database');
        }

        // Fetch company name from 'companies' table
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('name')
          .eq('id', userDetails.company_id)
          .single();

        if (companyError) {
          throw new Error(`Company fetch error: ${companyError.message}`);
        }
        if (!company) {
          throw new Error('No company found for this user');
        }

        // Fetch user roles
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('roles(role_name)')
          .eq('user_id', userDetails.id);

        if (rolesError) {
          throw new Error(`Roles fetch error: ${rolesError.message}`);
        }

        const roleNames = roles ? roles.map((role: any) => role.roles.role_name) : [];

        setUserData({
          companyName: company.name,
          fullName: userDetails.name,
          roles: roleNames,
        });
      } catch (err: any) {
        const errorMessage = err.message || 'Unknown error occurred';
        setError(`Failed to fetch user data: ${errorMessage}`);
        console.error('Detailed error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { userData, isLoading, error };
}