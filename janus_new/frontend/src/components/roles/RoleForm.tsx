"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface RoleFormData {
  role_name: string;
  description: string;
  permissions: Record<string, string[]>;
}

interface RoleFormProps {
  initialData?: RoleFormData;
  onSubmit: (data: RoleFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  isSystemRole?: boolean; // To disable fields for system roles like "Super Admin"
  roleNameDisabled?: boolean; // Specifically disable role name (e.g. for Super Admin)
}

// Define core modules and their actions
export const CORE_MODULES_PERMISSIONS: Record<string, { name: string; actions: string[] }> = {
  user_management: {
    name: "User Management",
    actions: ["read", "create_invite", "update_status", "update_roles", "delete"]
  },
  role_management: {
    name: "Role Management",
    actions: ["read", "create", "update", "delete"]
  },
  activity_log: {
    name: "Activity Log",
    actions: ["read"]
  },
  // Add other modules as needed, e.g.:
  // product_management: { name: "Product Management", actions: ["read", "create", "update", "delete", "manage_inventory"] },
  // order_management: { name: "Order Management", actions: ["read", "create", "update_status", "process_payment"] },
};


const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  isSystemRole = false,
  roleNameDisabled = false,
}) => {
  const [formData, setFormData] = useState<RoleFormData>({
    role_name: '',
    description: '',
    permissions: {},
    ...initialData, // Spread initialData here to overwrite defaults if provided
  });
  
  // Initialize permissions state based on CORE_MODULES_PERMISSIONS if initialData is not fully populated
  useEffect(() => {
    const initialPermissions = { ...initialData?.permissions } || {};
    // Ensure all core modules are present in the permissions state, even if empty
    Object.keys(CORE_MODULES_PERMISSIONS).forEach(moduleKey => {
      if (!initialPermissions[moduleKey]) {
        initialPermissions[moduleKey] = [];
      }
    });
    setFormData(prev => ({ ...prev, permissions: initialPermissions }));
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (moduleKey: string, action: string, checked: boolean) => {
    setFormData(prev => {
      const currentModuleActions = prev.permissions[moduleKey] ? [...prev.permissions[moduleKey]] : [];
      if (checked) {
        if (!currentModuleActions.includes(action)) {
          currentModuleActions.push(action);
        }
      } else {
        const index = currentModuleActions.indexOf(action);
        if (index > -1) {
          currentModuleActions.splice(index, 1);
        }
      }
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleKey]: currentModuleActions,
        },
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Filter out modules with no permissions selected before submitting
    const permissionsToSubmit: Record<string, string[]> = {};
    for (const moduleKey in formData.permissions) {
      if (formData.permissions[moduleKey].length > 0) {
        permissionsToSubmit[moduleKey] = formData.permissions[moduleKey];
      }
    }
    onSubmit({ ...formData, permissions: permissionsToSubmit });
  };

  const formDisabled = isLoading || (isSystemRole && roleNameDisabled); // More specific disabling

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md text-center">{error}</p>}
      
      <Input
        label="Role Name"
        id="role_name"
        name="role_name"
        value={formData.role_name}
        onChange={handleChange}
        placeholder="e.g., Sales Manager, Inventory Clerk"
        required
        disabled={formDisabled || roleNameDisabled}
        className={ (formDisabled || roleNameDisabled) ? "bg-gray-600 cursor-not-allowed" : ""}
      />
      <Textarea
        label="Description"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Briefly describe the responsibilities of this role."
        rows={3}
        disabled={formDisabled && !roleNameDisabled && isSystemRole} // Allow description edit for system roles if name is disabled but form isn't fully disabled
        className={(formDisabled && !roleNameDisabled && isSystemRole) ? "bg-gray-600 cursor-not-allowed" : ""}
      />

      <div>
        <h4 className="text-lg font-medium text-gray-200 mb-3">Permissions</h4>
        {Object.entries(CORE_MODULES_PERMISSIONS).map(([moduleKey, moduleDetails]) => (
          <div key={moduleKey} className="mb-5 p-4 border border-gray-700 rounded-lg bg-gray-700/30">
            <h5 className="text-md font-semibold text-orange-400 mb-3">{moduleDetails.name}</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {moduleDetails.actions.map(action => (
                <label key={action} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions[moduleKey]?.includes(action) || false}
                    onChange={(e) => handlePermissionChange(moduleKey, action, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-orange-600 bg-gray-600 border-gray-500 rounded focus:ring-orange-500 focus:ring-offset-gray-800 disabled:opacity-50"
                    disabled={formDisabled && isSystemRole} // Disable permission changes for system roles if form is generally disabled for them
                  />
                  <span className={`text-sm ${ (formDisabled && isSystemRole) ? 'text-gray-500' : 'text-gray-300'}`}>{action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} disabled={formDisabled && isSystemRole}>
          {initialData ? 'Save Changes' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
