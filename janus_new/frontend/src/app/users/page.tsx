'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner'; 
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import UserForm, { UserInviteFormData, UserEditFormData, Role as UserFormRole } from '@/components/users/UserForm'; // Adjust path

// Define User interface matching backend UserResponse
interface User {
  id: number;
  auth_user_id: string; // UUID
  name: string;
  email: string;
  phone_number: string | null;
  is_active: boolean;
  roles: UserFormRole[]; // Reuse UserFormRole which is { id: number, role_name: string }
  created_at: string;
  company_id: number;
}

// Define Role interface as expected from /api/v1/roles
interface Role extends UserFormRole {}


export default function UsersPage() {
  const router = useRouter();
  const [isLoadingPage, setIsLoadingPage] = useState(true); // For initial auth check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false); // For data fetching/manipulation
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'invite' | 'edit'>('invite');
  const [currentUserForForm, setCurrentUserForForm] = useState<User | null>(null);

  const [currentUserDetails, setCurrentUserDetails] = useState<{ id: number | null, email: string | null, isSuperAdmin: boolean }>({ id: null, email: null, isSuperAdmin: false });


  // Authentication check & current user details
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser'); // Assuming this stores { userId (auth_user_id), email, possibly roles/name }

    if (!token) {
      router.replace('/signin');
      return;
    }
    setIsAuthenticated(true);

    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            // This is a simplified way to check for Super Admin for UI rules.
            // A proper check might involve fetching current user's full details including roles from backend.
            // For now, assuming 'currentUser' might hint at it or we rely on backend for actual restriction.
            // The task mentions "Prevent editing roles/status of the "Super Admin" user if it's the current logged-in user"
            // This implies we need to know if current logged-in user IS a super admin.
            // For the UserForm, we pass isCurrentUserSuperAdmin and isTargetUserSuperAdmin.
            // Backend will ultimately enforce these rules.
            // Let's assume for now that we don't have a definitive "isSuperAdmin" flag for the logged-in user on the frontend easily.
            // The UserForm's disable logic will primarily be based on isTargetUserSuperAdmin.
            setCurrentUserDetails({ id: parsedUser.userId, email: parsedUser.email, isSuperAdmin: false }); // Placeholder for isSuperAdmin
        } catch (e) {
            console.error("Failed to parse current user from localStorage:", e);
        }
    }
    setIsLoadingPage(false);
  }, [router]);

  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/v1/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) router.replace('/signin');
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch users");
      }
      const data = await response.json(); // Expects UserListResponse { items: User[], total: number }
      setUsers(data.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, router]);

  const fetchRoles = useCallback(async () => {
    if (!isAuthenticated) return;
    // No separate loading state for roles, assume it's quick or part of overall loading
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/v1/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        // Don't redirect for roles fetch failure, but log error
        const errData = await response.json();
        console.error("Failed to fetch roles:", errData.detail || "Unknown error");
        setError(prev => prev ? `${prev}\nFailed to fetch roles.` : "Failed to fetch roles.");
        return; // Don't proceed if roles can't be fetched
      }
      const data: Role[] = await response.json();
      setAvailableRoles(data);
    } catch (err: any) {
      console.error("Error fetching roles:", err);
      setError(prev => prev ? `${prev}\nError fetching roles.` : "Error fetching roles.");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAuthenticated, fetchUsers, fetchRoles]);

  const handleInviteUser = () => {
    setFormMode('invite');
    setCurrentUserForForm(null);
    setError(null); // Clear previous form errors
    setSuccessMessage(null);
    setIsFormModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormMode('edit');
    setCurrentUserForForm(user);
    setError(null);
    setSuccessMessage(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: UserInviteFormData | UserEditFormData) => {
    if (!isAuthenticated) return Promise.reject("Not authenticated");
    setIsLoadingData(true); // Use global loading for form submission
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('accessToken');
    
    let response;
    try {
      if (formMode === 'invite') {
        response = await fetch('/api/v1/users/invite', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else { // mode === 'edit'
        if (!currentUserForForm) throw new Error("No user selected for editing.");
        response = await fetch(`/api/v1/users/${currentUserForForm.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) router.replace('/signin');
        throw new Error(data.detail || "Operation failed");
      }

      setIsFormModalOpen(false);
      setCurrentUserForForm(null);
      if (formMode === 'invite') {
        setSuccessMessage(`Invitation sent to ${data.email}. Invite Code: ${data.code}`);
        // Optionally, refetch users if invites change user list view (e.g. pending invites)
        // For now, invite does not add to users list directly.
      } else {
        setSuccessMessage(`User ${data.name || data.email} updated successfully.`);
        await fetchUsers(); // Refetch users list after edit
      }
      setTimeout(() => setSuccessMessage(null), 5000); // Clear success message after 5s
      return data; // Resolve promise with data

    } catch (err: any) {
      setError(err.message); // Set error to be displayed in the form or globally
      // Do not close modal on error, let form display it
      throw err; // Re-throw to indicate submission failure to UserForm if needed
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Initial page loading (auth check)
  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Spinner size="lg" /><p className="mt-4 text-lg">Loading User Management...</p>
      </div>
    );
  }
  if (!isAuthenticated) return null; // Should be redirected

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fadeIn">
      <header className="mb-8 pb-4 border-b border-gray-700 flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold text-orange-500">User Management</h1>
            <p className="text-lg text-gray-400 mt-1">Manage users, their roles, and status within your company.</p>
        </div>
        <Button onClick={handleInviteUser} variant="primary" disabled={isLoadingData || !availableRoles.length}>
            Invite New User
        </Button>
      </header>

      {isLoadingData && !users.length && <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>}
      
      {/* Global Error/Success Messages */}
      {error && !isFormModalOpen && ( /* Show global error if modal is closed */
        <div className="mb-6 bg-red-800/30 border border-red-700 text-red-300 p-3 rounded-md text-center">
          <p>Error: {error}</p>
          <Button onClick={() => { setError(null); fetchUsers(); fetchRoles(); }} variant="secondary" size="sm" className="mt-2 text-xs">Try Again</Button>
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-green-800/30 border border-green-700 text-green-300 p-3 rounded-md text-center">
          <p>{successMessage}</p>
        </div>
      )}

      {!isLoadingData && !error && users.length === 0 && (
         <div className="text-center py-10 bg-gray-800 p-6 rounded-lg shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0zM17 20h5v-1a6 6 0 00-4-5.658" />
            </svg>
            <h2 className="mt-4 text-2xl font-semibold text-gray-300">No Users Found</h2>
            <p className="mt-2 text-gray-500">Get started by inviting new users to your company.</p>
        </div>
      )}

      {!error && users.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 shadow-xl rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Roles</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/60 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.roles.length > 0 ? user.roles.map(role => role.role_name).join(', ') : 'No roles'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.is_active ? 
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-700/60 text-green-300 border border-green-600">Active</span> : 
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-700/60 text-red-300 border border-red-600">Inactive</span>
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Button onClick={() => handleEditUser(user)} variant="ghost" size="sm" className="p-1 text-orange-400 hover:text-orange-300 disabled:opacity-50" disabled={isLoadingData}>
                      Edit
                    </Button>
                    {/* Delete User button omitted as per backend (deactivation preferred) */}
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
            onClose={() => { setIsFormModalOpen(false); setError(null); /* Clear form-specific error on modal close */ }}
            title={formMode === 'invite' ? 'Invite New User' : `Edit User: ${currentUserForForm?.name || ''}`}
            size="lg"
        >
          <UserForm
            mode={formMode}
            initialData={formMode === 'edit' ? currentUserForForm : undefined}
            availableRoles={availableRoles}
            onSubmit={handleFormSubmit}
            onCancel={() => { setIsFormModalOpen(false); setError(null); }}
            isLoading={isLoadingData} // Pass global loading state for form submission
            error={error} // Pass error to be displayed within the form
            isTargetUserSuperAdmin={currentUserForForm?.roles.some(r => r.role_name === "Super Admin")} // Example check
            // isCurrentUserSuperAdmin can be passed if we have that info for the logged-in user
          />
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
