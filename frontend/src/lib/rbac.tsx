'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Define role types
export type Role = 
  | 'owner'
  | 'admin'
  | 'sales_supervisor'
  | 'sales_rep'
  | 'procurement_supervisor'
  | 'procurement_rep'
  | 'production_supervisor'
  | 'machine_operator'
  | 'packaging_supervisor'
  | 'packaging_person'
  | 'transport_supervisor'
  | 'transport_person'
  | 'store_supervisor'
  | 'store_person'
  | 'hr_supervisor';

// Define permission types
export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'invite_users'
  | 'manage_roles'
  | 'view_sales'
  | 'create_sales'
  | 'edit_sales'
  | 'delete_sales'
  | 'view_purchases'
  | 'create_purchases'
  | 'edit_purchases'
  | 'delete_purchases'
  | 'view_production'
  | 'create_production'
  | 'edit_production'
  | 'delete_production'
  | 'view_packaging'
  | 'create_packaging'
  | 'edit_packaging'
  | 'delete_packaging'
  | 'view_transport'
  | 'create_transport'
  | 'edit_transport'
  | 'delete_transport'
  | 'view_inventory'
  | 'manage_inventory'
  | 'view_reports'
  | 'view_analytics';

// Define role-permission mapping
export const rolePermissions: Record<Role, Permission[]> = {
  owner: [
    'view_dashboard', 'manage_users', 'invite_users', 'manage_roles',
    'view_sales', 'create_sales', 'edit_sales', 'delete_sales',
    'view_purchases', 'create_purchases', 'edit_purchases', 'delete_purchases',
    'view_production', 'create_production', 'edit_production', 'delete_production',
    'view_packaging', 'create_packaging', 'edit_packaging', 'delete_packaging',
    'view_transport', 'create_transport', 'edit_transport', 'delete_transport',
    'view_inventory', 'manage_inventory', 'view_reports', 'view_analytics'
  ],
  admin: [
    'view_dashboard', 'manage_users', 'invite_users', 'manage_roles',
    'view_sales', 'create_sales', 'edit_sales', 'delete_sales',
    'view_purchases', 'create_purchases', 'edit_purchases', 'delete_purchases',
    'view_production', 'create_production', 'edit_production', 'delete_production',
    'view_packaging', 'create_packaging', 'edit_packaging', 'delete_packaging',
    'view_transport', 'create_transport', 'edit_transport', 'delete_transport',
    'view_inventory', 'manage_inventory', 'view_reports', 'view_analytics'
  ],
  sales_supervisor: [
    'view_dashboard', 'invite_users',
    'view_sales', 'create_sales', 'edit_sales', 'delete_sales',
    'view_inventory', 'view_reports', 'view_analytics'
  ],
  sales_rep: [
    'view_dashboard',
    'view_sales', 'create_sales', 'edit_sales',
    'view_inventory'
  ],
  procurement_supervisor: [
    'view_dashboard', 'invite_users',
    'view_purchases', 'create_purchases', 'edit_purchases', 'delete_purchases',
    'view_inventory', 'view_reports', 'view_analytics'
  ],
  procurement_rep: [
    'view_dashboard',
    'view_purchases', 'create_purchases', 'edit_purchases',
    'view_inventory'
  ],
  production_supervisor: [
    'view_dashboard', 'invite_users',
    'view_production', 'create_production', 'edit_production', 'delete_production',
    'view_inventory', 'view_reports', 'view_analytics'
  ],
  machine_operator: [
    'view_dashboard',
    'view_production', 'create_production', 'edit_production',
    'view_inventory'
  ],
  packaging_supervisor: [
    'view_dashboard', 'invite_users',
    'view_packaging', 'create_packaging', 'edit_packaging', 'delete_packaging',
    'view_inventory', 'view_reports', 'view_analytics'
  ],
  packaging_person: [
    'view_dashboard',
    'view_packaging', 'create_packaging', 'edit_packaging',
    'view_inventory'
  ],
  transport_supervisor: [
    'view_dashboard', 'invite_users',
    'view_transport', 'create_transport', 'edit_transport', 'delete_transport',
    'view_inventory', 'view_reports', 'view_analytics'
  ],
  transport_person: [
    'view_dashboard',
    'view_transport', 'create_transport', 'edit_transport',
    'view_inventory'
  ],
  store_supervisor: [
    'view_dashboard', 'invite_users',
    'view_inventory', 'manage_inventory', 'view_reports', 'view_analytics'
  ],
  store_person: [
    'view_dashboard',
    'view_inventory', 'manage_inventory'
  ],
  hr_supervisor: [
    'view_dashboard', 'manage_users', 'invite_users',
    'view_reports', 'view_analytics'
  ]
};

// Define role colors for UI
export const roleColors: Record<Role, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-indigo-100 text-indigo-800',
  sales_supervisor: 'bg-blue-100 text-blue-800',
  sales_rep: 'bg-blue-50 text-blue-600',
  procurement_supervisor: 'bg-green-100 text-green-800',
  procurement_rep: 'bg-green-50 text-green-600',
  production_supervisor: 'bg-yellow-100 text-yellow-800',
  machine_operator: 'bg-yellow-50 text-yellow-600',
  packaging_supervisor: 'bg-orange-100 text-orange-800',
  packaging_person: 'bg-orange-50 text-orange-600',
  transport_supervisor: 'bg-red-100 text-red-800',
  transport_person: 'bg-red-50 text-red-600',
  store_supervisor: 'bg-teal-100 text-teal-800',
  store_person: 'bg-teal-50 text-teal-600',
  hr_supervisor: 'bg-pink-100 text-pink-800'
};

// Define role display names
export const roleDisplayNames: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  sales_supervisor: 'Sales Supervisor',
  sales_rep: 'Sales Representative',
  procurement_supervisor: 'Procurement Supervisor',
  procurement_rep: 'Procurement Representative',
  production_supervisor: 'Production Supervisor',
  machine_operator: 'Machine Operator',
  packaging_supervisor: 'Packaging Supervisor',
  packaging_person: 'Packaging Person',
  transport_supervisor: 'Transport Supervisor',
  transport_person: 'Transport Person',
  store_supervisor: 'Store Supervisor',
  store_person: 'Store Person',
  hr_supervisor: 'HR Supervisor'
};

// Define the RBAC context type
interface RBACContextType {
  userRoles: Role[];
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  isLoading: boolean;
}

// Create the RBAC context
const RBACContext = createContext<RBACContextType>({
  userRoles: [],
  hasPermission: () => false,
  hasRole: () => false,
  isLoading: true,
});

// RBAC Provider props
interface RBACProviderProps {
  children: ReactNode;
}

// RBAC Provider component
export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user roles on mount
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('Error fetching user:', userError);
          router.push('/auth/login');
          return;
        }
        
        // Get user roles from database
        const { data: userRolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          setUserRoles([]);
        } else {
          // Extract roles from the data
          const roles = userRolesData.map(ur => ur.role as Role);
          setUserRoles(roles.length > 0 ? roles : ['sales_rep']); // Default to sales_rep if no roles assigned
        }
      } catch (error) {
        console.error('Error in fetchUserRoles:', error);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [router]);

  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    // If no roles, deny access
    if (userRoles.length === 0) return false;
    
    // Check if any of the user's roles grant the permission
    return userRoles.some(role => 
      rolePermissions[role]?.includes(permission)
    );
  };

  // Check if user has a specific role
  const hasRole = (role: Role): boolean => {
    return userRoles.includes(role);
  };

  return (
    <RBACContext.Provider value={{ userRoles, hasPermission, hasRole, isLoading }}>
      {children}
    </RBACContext.Provider>
  );
};

// Custom hook to use RBAC context
export const useRBAC = () => useContext(RBACContext);

// Permission guard component
interface PermissionGuardProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { hasPermission, isLoading } = useRBAC();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

// Role guard component
interface RoleGuardProps {
  role: Role | Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  role, 
  children, 
  fallback = null 
}) => {
  const { hasRole, isLoading } = useRBAC();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  const roles = Array.isArray(role) ? role : [role];
  const hasAnyRole = roles.some(r => hasRole(r));
  
  return hasAnyRole ? <>{children}</> : <>{fallback}</>;
};
