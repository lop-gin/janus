'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner'; 
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import RoleForm, { RoleFormData, CORE_MODULES_PERMISSIONS } from '@/components/roles/RoleForm'; // Adjust path as needed

// Define Role interface matching backend RoleResponse
interface Role {
  id: number;
  company_id: number;
  role_name: string;
  description: string | null;
  permissions: Record<string, string[]>;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export default function RolesPage() {
  const router = useRouter();
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial auth check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false); // For data fetching/manipulation
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null); // For editing or deleting

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/signin');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoadingPage(false);
  }, [router]);

  const fetchRoles = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/v1/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) router.replace('/signin');
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch roles");
      }
      const data: Role[] = await response.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoles();
    }
  }, [isAuthenticated, fetchRoles]);

  const handleCreateNewRole = () => {
    setCurrentRole(null);
    setIsFormModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.role_name === "Super Admin" && role.is_system_role) {
      // For Super Admin, pre-populate but set flags to disable certain fields in RoleForm
      // The RoleForm component will handle disabling based on isSystemRole and roleNameDisabled
      setCurrentRole({
        ...role,
        // permissions are fetched, so they are accurate
      });
    } else {
      setCurrentRole(role);
    }
    setIsFormModalOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (role.role_name === "Super Admin" && role.is_system_role) {
        setError("The Super Admin role cannot be deleted.");
        setTimeout(() => setError(null), 3000);
        return;
    }
    setCurrentRole(role);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (!currentRole || !isAuthenticated) return;
    setIsLoadingData(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/v1/roles/${currentRole.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) router.replace('/signin');
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to delete role");
      }
      setRoles(prevRoles => prevRoles.filter(role => role.id !== currentRole.id));
      setIsDeleteModalOpen(false);
      setCurrentRole(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFormSubmit = async (formData: RoleFormData) => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    const method = currentRole ? 'PUT' : 'POST';
    const url = currentRole ? `/api/v1/roles/${currentRole.id}` : '/api/v1/roles';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) router.replace('/signin');
        const errData = await response.json();
        throw new Error(errData.detail || (currentRole ? "Failed to update role" : "Failed to create role"));
      }
      // const savedRole: Role = await response.json(); // Backend returns the created/updated role
      await fetchRoles(); // Refetch all roles to get the latest list
      setIsFormModalOpen(false);
      setCurrentRole(null);
    } catch (err: any) {
      setError(err.message); // This error will be passed to RoleForm
      // Keep modal open if form submission fails, error is shown in form
      // For critical errors not caught by form, might need global error display
      // If error is specific to form (e.g. validation from backend), it will be handled by RoleForm's error prop
      // If it's a general API error, it's caught here.
      // To ensure the modal's own error display works, we might need to set a specific error state for the modal
      // For now, this general error will be passed to RoleForm.
      return; // Prevent modal from closing on general error
    } finally {
      setIsLoadingData(false); // This affects global loading, RoleForm has its own isLoading
    }
  };
  
  // Initial page loading (auth check)
  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Loading Role Management...</p>
      </div>
    );
  }
  if (!isAuthenticated) return null; // Should be redirected by useEffect

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fadeIn">
      <header className="mb-8 pb-4 border-b border-gray-700 flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold text-orange-500">Role Management</h1>
            <p className="text-lg text-gray-400 mt-1">Define roles and manage their permissions for your company.</p>
        </div>
        <Button onClick={handleCreateNewRole} variant="primary" disabled={isLoadingData}>
            Create New Role
        </Button>
      </header>

      {isLoadingData && !roles.length && <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>}
      {!isLoadingData && error && (
        <div className="bg-red-800/30 border border-red-700 text-red-300 p-4 rounded-lg text-center mb-6">
          <p>Error: {error}</p>
          <Button onClick={() => { setError(null); fetchRoles(); }} variant="secondary" className="mt-2">Try Again</Button>
        </div>
      )}
      {!isLoadingData && !error && roles.length === 0 && (
         <div className="text-center py-10 bg-gray-800 p-6 rounded-lg shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-300">No Roles Found</h2>
            <p className="mt-2 text-gray-500">Get started by creating a new role for your team members.</p>
        </div>
      )}

      {!error && roles.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 shadow-xl rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">System Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-700/60 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{role.role_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 max-w-sm truncate" title={role.description || ''}>{role.description || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {role.is_system_role ? 
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-700/50 text-blue-300 border border-blue-600">Yes</span> : 
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-600/50 text-gray-300 border border-gray-500">No</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Button onClick={() => handleEditRole(role)} variant="ghost" size="sm" className="p-1 text-orange-400 hover:text-orange-300 disabled:opacity-50" disabled={isLoadingData}>
                      Edit
                    </Button>
                    <Button 
                        onClick={() => handleDeleteRole(role)} 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 text-red-500 hover:text-red-400 disabled:opacity-50" 
                        disabled={isLoadingData || (role.is_system_role && role.role_name === "Super Admin")}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormModalOpen && (
        <Modal 
            isOpen={isFormModalOpen} 
            onClose={() => { setIsFormModalOpen(false); setError(null); /* Clear global error on modal close */ }}
            title={currentRole ? 'Edit Role' : 'Create New Role'}
            size="xl" // Use a larger modal for the form with permissions
        >
          <RoleForm
            initialData={currentRole ? { 
                role_name: currentRole.role_name, 
                description: currentRole.description || '', 
                permissions: currentRole.permissions 
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormModalOpen(false); setError(null); }}
            isLoading={isLoadingData} // Pass a loading state specific to form submission
            error={error} // Pass error to be displayed within the form
            isSystemRole={currentRole?.is_system_role && currentRole?.role_name === "Super Admin"}
            roleNameDisabled={currentRole?.is_system_role && currentRole?.role_name === "Super Admin"}
          />
        </Modal>
      )}

      {isDeleteModalOpen && currentRole && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete Role" size="md">
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete the role <strong className="text-orange-400">{currentRole.role_name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoadingData}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteRole} isLoading={isLoadingData}>Delete Role</Button>
          </div>
        </Modal>
      )}
      
      <div className="mt-10">
        <Link href="/dashboard" legacyBehavior>
          <a className="text-orange-500 hover:text-orange-400 transition-colors duration-200 text-sm">
            &larr; Back to Dashboard
          </a>
        </Link>
      </div>
      <footer className="mt-16 pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-500 text-sm">Recordserp &copy; {new Date().getFullYear()}. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
