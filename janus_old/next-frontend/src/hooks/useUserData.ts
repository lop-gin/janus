import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';

// Define types (move to a separate types.ts file if preferred)
interface User {
  id: number;
  auth_user_id: string;
  company_id: string;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

interface UserRole {
  user_id: number;
  role_id: number;
  roles: {
    role_name: string;
  };
}

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
          .from('users' as any)
          .select('id, company_id, name')
          .eq('auth_user_id', user.id)
          .single() as { data: User | null, error: any };

        if (userError) {
          throw new Error(`User fetch error: ${userError.message}`);
        }
        if (!userDetails) {
          throw new Error('No user found in database');
        }

        // Fetch company name from 'companies' table
        const { data: company, error: companyError } = await supabase
          .from('companies' as any)
          .select('name')
          .eq('id', userDetails.company_id)
          .single() as { data: Company | null, error: any };

        if (companyError) {
          throw new Error(`Company fetch error: ${companyError.message}`);
        }
        if (!company) {
          throw new Error('No company found for this user');
        }

        // Fetch user roles
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles' as any)
          .select('roles(role_name)') // Nested select for the 'roles' relation
          .eq('user_id', userDetails.id) as { data: UserRole[] | null, error: any };

        if (rolesError) {
          throw new Error(`Roles fetch error: ${rolesError.message}`);
        }

        const roleNames = roles ? roles.map((role) => role.roles.role_name) : [];

        setUserData({
          companyName: company.name,
          fullName: userDetails.name,
          roles: roleNames,
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to fetch user data: ${errorMessage}`);
        console.error('Detailed error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]); // Updated dependency to user?.id for stability

  return { userData, isLoading, error };
}