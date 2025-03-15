'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormLayout from '@/components/FormLayout';
import FormField from '@/components/FormField';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { supabase } from '@/lib/supabase';
import { Role, roleDisplayNames, roleColors } from '@/lib/rbac';
import { useRBAC, PermissionGuard } from '@/lib/rbac';

export default function ManageRolesPage() {
  const router = useRouter();
  const { hasPermission } = useRBAC();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  
  // Role assignment state
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ value: string; label: string }[]>([]);
  
  // Fetch users and roles on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from Supabase
        // For now, we'll use mock data
        const mockUsers = [
          { id: '1', email: 'admin@example.com', first_name: 'Admin', last_name: 'User', roles: ['admin'] },
          { id: '2', email: 'sales@example.com', first_name: 'Sales', last_name: 'Manager', roles: ['sales_supervisor'] },
          { id: '3', email: 'production@example.com', first_name: 'Production', last_name: 'Manager', roles: ['production_supervisor'] },
          { id: '4', email: 'employee1@example.com', first_name: 'John', last_name: 'Doe', roles: ['sales_rep'] },
          { id: '5', email: 'employee2@example.com', first_name: 'Jane', last_name: 'Smith', roles: ['machine_operator'] },
        ];
        
        setUsers(mockUsers);
        
        // Prepare available roles for dropdown
        const roles = Object.entries(roleDisplayNames).map(([value, label]) => ({
          value,
          label
        }));
        
        setAvailableRoles(roles);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle user selection
  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(userId);
      setUserRoles(user.roles as Role[]);
    }
  };
  
  // Handle role toggle
  const handleRoleToggle = (role: Role) => {
    if (userRoles.includes(role)) {
      // Remove role
      setUserRoles(userRoles.filter(r => r !== role));
    } else {
      // Add role
      setUserRoles([...userRoles, role]);
    }
  };
  
  // Handle save roles
  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // In a real app, this would update roles in Supabase
      // For now, we'll just update our local state
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser) {
          return { ...user, roles: userRoles };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSuccess('User roles updated successfully!');
      
      // Reset selection
      setSelectedUser(null);
      setUserRoles([]);
    } catch (error) {
      console.error('Error updating roles:', error);
      setError('Failed to update roles. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // User table columns
  const userColumns = [
    {
      header: 'Name',
      accessor: 'id',
      cell: (value: string, row: any) => (
        <div className="flex items-center">
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {row.first_name} {row.last_name}
            </div>
            <div className="text-sm text-gray-500">
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Roles',
      accessor: 'roles',
      cell: (value: Role[], row: any) => (
        <div className="flex flex-wrap gap-1">
          {value.map((role) => (
            <span
              key={role}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[role]}`}
            >
              {roleDisplayNames[role]}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (value: string) => (
        <Button
          type="button"
          variant="link"
          onClick={() => handleUserSelect(value)}
        >
          Manage Roles
        </Button>
      ),
    },
  ];
  
  return (
    <PermissionGuard
      permission="manage_roles"
      fallback={
        <FormLayout
          title="Access Denied"
          subtitle="You don't have permission to manage user roles"
        >
          <div className="text-center py-8">
            <p className="text-gray-500">
              Please contact your administrator for access to this feature.
            </p>
            <Button
              type="button"
              variant="primary"
              className="mt-4"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </FormLayout>
      }
    >
      <FormLayout
        title="Manage User Roles"
        subtitle="Assign roles to users to control their access to different parts of the system"
        isLoading={isLoading}
        error={error}
        success={success}
      >
        <div className="space-y-6">
          <Card>
            <Table
              columns={userColumns}
              data={users}
              emptyMessage="No users found"
            />
          </Card>
          
          {selectedUser && (
            <Card
              title="Assign Roles"
              subtitle={`Select roles for ${users.find(u => u.id === selectedUser)?.first_name} ${users.find(u => u.id === selectedUser)?.last_name}`}
              footer={
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserRoles([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveRoles}
                    isLoading={isLoading}
                  >
                    Save Roles
                  </Button>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRoles.map(({ value, label }) => (
                  <div key={value} className="flex items-center">
                    <input
                      id={`role-${value}`}
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={userRoles.includes(value as Role)}
                      onChange={() => handleRoleToggle(value as Role)}
                    />
                    <label
                      htmlFor={`role-${value}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </FormLayout>
    </PermissionGuard>
  );
}
