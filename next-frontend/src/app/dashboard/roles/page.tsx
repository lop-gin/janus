'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import AddRoleModal from '@/components/modals/AddRoleModal';
import { toast } from 'sonner';

// Role interface matching backend model
interface Role {
  id: number;
  company_id: number;
  role_name: string;
  description?: string;
  color: string;
  permissions: { [key: string]: { [key: string]: string[] } | string[] };
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

// Available colors from role_color ENUM
const availableColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
  green: { bg: 'bg-green-100', text: 'text-green-800' },
  red: { bg: 'bg-red-100', text: 'text-red-800' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-800' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-800' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-800' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-800' },
};

// Permissions structure matching UI
const defaultPermissions = {
  Sales: {
    Invoice: { create: false, edit: false, delete: false },
    'Sale Receipt': { create: false, edit: false, delete: false },
    'Refund Receipt': { create: false, edit: false, delete: false },
    'Credit Note': { create: false, edit: false, delete: false },
  },
  Procurement: {
    'Purchase Order': { create: false, edit: false, delete: false },
    'Supplier Invoice': { create: false, edit: false, delete: false },
    'Goods Received Note': { create: false, edit: false, delete: false },
  },
  Employee: {
    Profile: { create: false, edit: false, delete: false },
    Timesheet: { create: false, edit: false, delete: false },
    'Leave Request': { create: false, edit: false, delete: false },
    user_management: { create: false, edit: false, delete: false },
    role_management: { create: false, edit: false, delete: false },
  },
};

const RoleManagement = () => {
  const { user, isLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissions);

  // Redirect if not authenticated or unauthorized
  useEffect(() => {
    if (!isLoading && (!user || !hasPermission('Employee', 'role_management', 'view'))) {
      router.push('/auth/login');
    }
  }, [user, isLoading, hasPermission, router]);

  // Fetch roles on mount
  useEffect(() => {
    if (user && hasPermission('Employee', 'role_management', 'view')) {
      fetchRoles();
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch roles');
    }
  };

  // Load permissions for selected role
  useEffect(() => {
    if (selectedRole) {
      const role = roles.find((r) => r.role_name === selectedRole);
      if (role) {
        const newPermissions = { ...defaultPermissions };
        Object.keys(role.permissions).forEach((module) => {
          if (newPermissions[module]) {
            Object.keys(role.permissions[module]).forEach((subModule) => {
              if (newPermissions[module][subModule]) {
                newPermissions[module][subModule] = {
                  create: role.permissions[module][subModule].includes('create'),
                  edit: role.permissions[module][subModule].includes('edit'),
                  delete: role.permissions[module][subModule].includes('delete'),
                };
              }
            });
          }
        });
        setPermissions(newPermissions);
      }
    } else {
      setPermissions(defaultPermissions);
    }
  }, [selectedRole, roles]);

  const handlePermissionChange = (section: string, item: string, permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [item]: {
          ...prev[section][item],
          [permission]: !prev[section][item][permission],
        },
      },
    }));
  };

  const handleSectionColumnToggle = (section: string, permission: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: Object.keys(prev[section]).reduce(
        (acc, item) => ({
          ...acc,
          [item]: { ...prev[section][item], [permission]: checked },
        }),
        {}
      ),
    }));
  };

  const handleSectionSelectAll = (section: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: Object.keys(prev[section]).reduce(
        (acc, item) => ({
          ...acc,
          [item]: { create: checked, edit: checked, delete: checked },
        }),
        {}
      ),
    }));
  };

  const handleAddRole = async (roleData: { name: string; description: string; color: string }) => {
    try {
      await api.post('/roles', {
        role_name: roleData.name,
        description: roleData.description,
        color: roleData.color,
        permissions: defaultPermissions,
      });
      toast.success('Role created successfully');
      setIsAddRoleModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create role');
    }
  };

  const handleSave = async () => {
    if (!selectedRole) {
      toast.error('Please select a role to save');
      return;
    }
    const role = roles.find((r) => r.role_name === selectedRole);
    if (!role || role.is_system_role) {
      toast.error('Cannot edit system roles');
      return;
    }
    try {
      // Convert permissions to backend format
      const formattedPermissions = Object.keys(permissions).reduce(
        (acc, module) => ({
          ...acc,
          [module]: Object.keys(permissions[module]).reduce((subAcc, subModule) => ({
            ...subAcc,
            [subModule]: Object.keys(permissions[module][subModule]).filter(
              (perm) => permissions[module][subModule][perm]
            ),
          }), {}),
        }),
        {}
      );
      await api.put(`/roles/${role.id}`, {
        role_name: role.role_name,
        description: role.description,
        color: role.color,
        permissions: formattedPermissions,
      });
      toast.success('Role updated successfully');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role');
    }
  };

  const handleReset = () => {
    setPermissions(defaultPermissions);
    setSelectedRole('');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Role Management</h1>
          <div className="mt-4 border-b border-gray-200"></div>
          <div className="flex justify-between items-center mb-6">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select a role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="" className="text-gray-400">
                  Select a role
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
            {hasPermission('Employee', 'role_management', 'create') && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => setIsAddRoleModalOpen(true)}
              >
                Add Role
              </Button>
            )}
          </div>
          {selectedRole && (
            <div className="flex justify-center mb-6">
              <span
                className={`text-xl font-bold px-6 py-3 rounded-full ${
                  availableColors[roles.find((r) => r.role_name === selectedRole)?.color || 'blue'].bg
                } ${availableColors[roles.find((r) => r.role_name === selectedRole)?.color || 'blue'].text}`}
              >
                {selectedRole}
              </span>
            </div>
          )}
          <div className="space-y-6">
            {Object.keys(permissions).map((section) => (
              <div key={section} className="bg-white border border-gray-200 shadow-sm rounded-md p-4">
                <div className="grid grid-cols-5 gap-4 items-center bg-gray-200 p-3 mb-4 -m-4">
                  <div className="col-span-1">
                    <h2 className="text-lg font-bold text-gray-800">{section}</h2>
                  </div>
                  <div className="col-span-1 text-center">
                    <label className="flex items-center justify-center space-x-2">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSectionColumnToggle(section, 'create', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                        disabled={!hasPermission('Employee', 'role_management', 'edit')}
                      />
                      <span className="text-sm font-semibold text-gray-700">Create</span>
                    </label>
                  </div>
                  <div className="col-span-1 text-center">
                    <label className="flex items-center justify-center space-x-2">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSectionColumnToggle(section, 'edit', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                        disabled={!hasPermission('Employee', 'role_management', 'edit')}
                      />
                      <span className="text-sm font-semibold text-gray-700">Edit/Update</span>
                    </label>
                  </div>
                  <div className="col-span-1 text-center">
                    <label className="flex items-center justify-center space-x-2">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSectionColumnToggle(section, 'delete', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                        disabled={!hasPermission('Employee', 'role_management', 'edit')}
                      />
                      <span className="text-sm font-semibold text-gray-700">Delete</span>
                    </label>
                  </div>
                  <div className="col-span-1 text-center">
                    <label className="flex items-center justify-center space-x-2">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSectionSelectAll(section, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                        disabled={!hasPermission('Employee', 'role_management', 'edit')}
                      />
                      <span className="text-sm font-semibold text-gray-700">Select All</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.keys(permissions[section]).map((item) => (
                    <div key={item} className="grid grid-cols-5 gap-4 items-center">
                      <div className="col-span-1 text-gray-700 font-semibold">{item}</div>
                      <div className="col-span-1 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[section][item].create}
                          onChange={() => handlePermissionChange(section, item, 'create')}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                          disabled={!hasPermission('Employee', 'role_management', 'edit')}
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[section][item].edit}
                          onChange={() => handlePermissionChange(section, item, 'edit')}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                          disabled={!hasPermission('Employee', 'role_management', 'edit')}
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[section][item].delete}
                          onChange={() => handlePermissionChange(section, item, 'delete')}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                          disabled={!hasPermission('Employee', 'role_management', 'edit')}
                        />
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 bg-white border border-gray-200 shadow-sm px-6 py-4">
          <div className="flex justify-between">
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleReset}
            >
              Cancel
            </Button>
            {hasPermission('Employee', 'role_management', 'edit') && (
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </Button>
            )}
          </div>
        </div>
      </div>
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        onAddRole={handleAddRole}
        existingRoles={roles.map((role) => role.role_name)}
      />
    </div>
  );
};

export default RoleManagement;