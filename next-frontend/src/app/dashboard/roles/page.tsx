"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddRoleModal from '@/components/modals/AddRoleModal';

const RoleManagement = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState([
    { name: 'Admin', description: 'Full access role', color: 'blue' },
    { name: 'Editor', description: 'Edit content role', color: 'green' },
    { name: 'Viewer', description: 'View-only role', color: 'purple' },
  ]);
  const [permissions, setPermissions] = useState({
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
    },
  });

  const availableColors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
    green: { bg: 'bg-green-100', text: 'text-green-800' },
    red: { bg: 'bg-red-100', text: 'text-red-800' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    teal: { bg: 'bg-teal-100', text: 'text-teal-800' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
  };

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
      [section]: Object.keys(prev[section]).reduce((acc, item) => ({
        ...acc,
        [item]: { ...prev[section][item], [permission]: checked },
      }), {}),
    }));
  };

  const handleSectionSelectAll = (section: string, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: Object.keys(prev[section]).reduce((acc, item) => ({
        ...acc,
        [item]: { create: checked, edit: checked, delete: checked },
      }), {}),
    }));
  };

  const handleAddRole = (roleData: { name: string; description: string; color: string }) => {
    setRoles([...roles, roleData]);
    setIsAddRoleModalOpen(false);
  };

  const handleReset = () => {
    setPermissions({
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
      },
    });
    setSelectedRole('');
  };

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
                <option value="" className="text-gray-400">Select a role</option>
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsAddRoleModalOpen(true)}
            >
              Add Role
            </Button>
          </div>
          {selectedRole && (
            <div className="flex justify-center mb-6">
              <span
                className={`text-xl font-bold px-6 py-3 rounded-full ${
                  availableColors[roles.find((r) => r.name === selectedRole)?.color || 'blue'].bg
                } ${availableColors[roles.find((r) => r.name === selectedRole)?.color || 'blue'].text}`}
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
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[section][item].edit}
                          onChange={() => handlePermissionChange(section, item, 'edit')}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[section][item].delete}
                          onChange={() => handlePermissionChange(section, item, 'delete')}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded hover:shadow-sm"
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
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {}}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
      <AddRoleModal
        isOpen={isAddRoleModalOpen}
        onClose={() => setIsAddRoleModalOpen(false)}
        onAddRole={handleAddRole}
        existingRoles={roles.map((role) => role.name)}
      />
    </div>
  );
};

export default RoleManagement;