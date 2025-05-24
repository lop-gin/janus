"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input'; // Assuming Select is exported from Input.tsx

// Define Role interface as expected from /api/v1/roles
export interface Role {
  id: number;
  role_name: string;
  // other properties if needed by the form
}

// Data for inviting a user
export interface UserInviteFormData {
  email: string;
  full_name: string;
  role_id: number | string; // Can be string from form, convert to number
}

// Data for editing a user
export interface UserEditFormData {
  role_ids: number[];
  is_active: boolean;
}

interface UserFormProps {
  mode: 'invite' | 'edit';
  initialData?: any; // UserInviteFormData for invite, { roles: Role[], is_active: boolean, name: string, email: string } for edit
  availableRoles: Role[];
  onSubmit: (data: UserInviteFormData | UserEditFormData) => Promise<any>; // Return type can be specific if needed
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  isCurrentUserSuperAdmin?: boolean; // Is the logged-in user a Super Admin?
  isTargetUserSuperAdmin?: boolean; // Is the user being edited a Super Admin?
}

const UserForm: React.FC<UserFormProps> = ({
  mode,
  initialData,
  availableRoles,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  isCurrentUserSuperAdmin = false, // Default to false
  isTargetUserSuperAdmin = false, // Default to false
}) => {
  // Invite form state
  const [email, setEmail] = useState(mode === 'invite' ? initialData?.email || '' : '');
  const [fullName, setFullName] = useState(mode === 'invite' ? initialData?.full_name || '' : '');
  const [selectedInviteRoleId, setSelectedInviteRoleId] = useState<string>(mode === 'invite' ? String(initialData?.role_id || '') : '');

  // Edit form state
  const [selectedEditRoleIds, setSelectedEditRoleIds] = useState<number[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
  
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setSelectedEditRoleIds(initialData.roles?.map((r: Role) => r.id) || []);
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
      // Name and email are for display, not part of edit form data submission directly
    } else if (mode === 'invite' && initialData) {
        setEmail(initialData.email || '');
        setFullName(initialData.full_name || '');
        setSelectedInviteRoleId(String(initialData.role_id || ''));
    }
  }, [mode, initialData]);

  const handleRoleCheckboxChange = (roleId: number, checked: boolean) => {
    setSelectedEditRoleIds(prev =>
      checked ? [...prev, roleId] : prev.filter(id => id !== roleId)
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'invite') {
      if (!selectedInviteRoleId) {
        // Handle error: role must be selected for invite
        alert("Please select a role for the new user."); // Replace with better error display
        return;
      }
      onSubmit({ email, full_name: fullName, role_id: parseInt(selectedInviteRoleId) });
    } else { // mode === 'edit'
      onSubmit({ role_ids: selectedEditRoleIds, is_active: isActive });
    }
  };

  // Determine if form fields should be disabled for Super Admin target
  // Logged-in user cannot edit a Super Admin unless they are also a Super Admin (though this check is usually backend enforced)
  // For simplicity, if target is SA, certain fields might be disabled.
  // The task mentions "Prevent editing roles/status of the "Super Admin" user if it's the current logged-in user or the primary super admin"
  // This logic is simplified here: if the target user IS a Super Admin, we disable role/status changes.
  const disableEditForSuperAdminTarget = mode === 'edit' && isTargetUserSuperAdmin;


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">{error}</p>}
      
      {mode === 'invite' && (
        <>
          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            disabled={isLoading}
          />
          <Input
            label="Full Name"
            id="full_name"
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={isLoading}
          />
          <Select
            label="Assign Role"
            id="role_id"
            name="role_id"
            value={selectedInviteRoleId}
            onChange={(e) => setSelectedInviteRoleId(e.target.value)}
            options={availableRoles.map(role => ({ value: String(role.id), label: role.role_name }))}
            required
            disabled={isLoading}
          />
        </>
      )}

      {mode === 'edit' && initialData && (
        <>
          <Input
            label="Name"
            id="edit_name"
            name="edit_name"
            value={initialData.name || ''}
            disabled // Non-editable
            className="bg-gray-600 cursor-not-allowed"
          />
          <Input
            label="Email"
            id="edit_email"
            name="edit_email"
            value={initialData.email || ''}
            disabled // Non-editable
            className="bg-gray-600 cursor-not-allowed"
          />
          
          {/* Roles Checkboxes for Edit Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Roles</label>
            {availableRoles.length === 0 && <p className="text-sm text-gray-500">No roles available.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-700/30 rounded-md border border-gray-600">
                {availableRoles.map(role => (
                <label key={role.id} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-600/50 transition-colors">
                    <input
                    type="checkbox"
                    checked={selectedEditRoleIds.includes(role.id)}
                    onChange={(e) => handleRoleCheckboxChange(role.id, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-orange-600 bg-gray-600 border-gray-500 rounded focus:ring-orange-500 focus:ring-offset-gray-800 disabled:opacity-50"
                    disabled={isLoading || (disableEditForSuperAdminTarget && role.role_name === "Super Admin")} // Prevent removing SA role from SA
                    />
                    <span className={`text-sm ${ (isLoading || (disableEditForSuperAdminTarget && role.role_name === "Super Admin")) ? 'text-gray-500' : 'text-gray-300'}`}>{role.role_name}</span>
                </label>
                ))}
            </div>
          </div>

          {/* Status Select for Edit Mode */}
          <Select
            label="Status"
            id="is_active"
            name="is_active"
            value={isActive ? "true" : "false"}
            onChange={(e) => setIsActive(e.target.value === "true")}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            disabled={isLoading || disableEditForSuperAdminTarget}
            className={(isLoading || disableEditForSuperAdminTarget) ? "bg-gray-600 cursor-not-allowed" : ""}
          />
        </>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading || (mode === 'edit' && disableEditForSuperAdminTarget && !isCurrentUserSuperAdmin)}>
          {mode === 'invite' ? 'Send Invitation' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
