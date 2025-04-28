"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AddUserModal from '@/components/modals/AddUserModal';
import { ActionCell } from '@/components/forms/ItemsTable/cells/ActionCell';

interface User {
  id: number;
  name: string;
  email: string;
  gender: 'male' | 'female';
  roles: string[];
  lastActive: string;
  status: 'active' | 'deactivated';
  inviteStatus: 'invited' | 'pending';
}

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    gender: 'male',
    roles: ['Admin', 'Editor'],
    lastActive: '2023-04-15T14:30:00',
    status: 'active',
    inviteStatus: 'invited'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    gender: 'female',
    roles: ['Viewer'],
    lastActive: '2023-03-01T09:00:00',
    status: 'deactivated',
    inviteStatus: 'pending'
  },
  {
    id: 3,
    name: 'Alex Johnson',
    email: 'alex@example.com',
    gender: 'male',
    roles: ['Editor'],
    lastActive: '2025-04-10T10:15:00',
    status: 'active',
    inviteStatus: 'pending'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    gender: 'female',
    roles: ['Admin', 'Viewer'],
    lastActive: '2025-03-20T16:45:00',
    status: 'deactivated',
    inviteStatus: 'invited'
  },
  {
    id: 5,
    name: 'Michael Brown',
    email: 'michael@example.com',
    gender: 'male',
    roles: ['Viewer', 'Editor'],
    lastActive: '2025-04-25T08:00:00',
    status: 'active',
    inviteStatus: 'pending'
  },
];

const UsersPage = () => {
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [lastSeenFilter, setLastSeenFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const router = useRouter();

  useEffect(() => {
    setOriginalUsers(mockUsers);
  }, []);

  const filteredUsers = useMemo(() => {
    let result = originalUsers;

    if (selectedRole !== 'All') {
      result = result.filter((user) => user.roles.includes(selectedRole));
    }

    if (lastSeenFilter !== 'all') {
      const today = new Date();
      result = result.filter((user) => {
        const lastActiveDate = new Date(user.lastActive);
        const daysDiff = Math.floor((today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
        switch (lastSeenFilter) {
          case 'today':
            return daysDiff === 0;
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          case 'older':
            return daysDiff > 30;
          default:
            return true;
        }
      });
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerSearch) ||
          user.email.toLowerCase().includes(lowerSearch) ||
          user.roles.some((role) => role.toLowerCase().includes(lowerSearch))
      );
    }

    return result;
  }, [originalUsers, selectedRole, lastSeenFilter, searchTerm]);

  const handleAddUser = (userData: { name: string; email: string; gender: string; roles: string[] }) => {
    console.log('Adding user:', userData);
    setShowAddModal(false);
  };

  const handleStatusChange = (user: User) => {
    setConfirmation({
      message: `Are you sure you want to ${user.status === 'active' ? 'deactivate' : 'activate'} ${user.name}?`,
      onConfirm: () => {
        console.log(`Updating status for ${user.name}`);
        setOriginalUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: u.status === 'active' ? 'deactivated' : 'active' } : u))
        );
      },
    });
  };

  const handleInvite = (user: User) => {
    setConfirmation({
      message: `Send invitation to ${user.email}?`,
      onConfirm: () => {
        console.log(`Sending invitation to ${user.email}`);
        setOriginalUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, inviteStatus: 'invited' } : u)));
      },
    });
  };

  const handleDelete = (user: User) => {
    setConfirmation({
      message: `Are you sure you want to delete ${user.name}?`,
      onConfirm: () => {
        console.log(`Deleting user ${user.name}`);
        setOriginalUsers((prev) => prev.filter((u) => u.id !== user.id));
      },
    });
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }
  };

  const formatExactDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const getGenderColor = (gender: string) => {
    return gender === 'male' ? 'bg-blue-500' : 'bg-pink-500';
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">User Management</h1>
        <div className="mt-4 border-b border-gray-200"></div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Viewer">Viewer</option>
                <option value="Editor">Editor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Seen</label>
              <select
                className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md"
                value={lastSeenFilter}
                onChange={(e) => setLastSeenFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="older">Older</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search by name, email, or role"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
            >
              Add New User
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invite Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Active Status</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50 hover:shadow-sm transition duration-150 ease-in-out"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td
                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full ${getGenderColor(user.gender)} flex items-center justify-center text-white`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{formatRelativeTime(user.lastActive)}</p>
                    <p className="text-xs text-gray-400">{formatExactDate(user.lastActive)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.inviteStatus === 'invited' ? (
                      <span className="text-gray-500">Already Invited</span>
                    ) : user.status === 'deactivated' ? (
                      <span className="text-gray-500">Not Invited</span>
                    ) : (
                      <Button
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => handleInvite(user)}
                      >
                        Invite
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.status === 'active' ? 'Active' : 'Deactivated'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <div className="w-24">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => router.push(`/users/${user.id}`)}
                        >
                          View/Edit
                        </Button>
                      </div>
                      <div className="w-24">
                        <Button
                          size="sm"
                          className={`w-full ${user.status === 'active' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                          onClick={() => handleStatusChange(user)}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                      <div className="w-24 flex justify-center">
                        <ActionCell onRemove={() => handleDelete(user)} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddUser={handleAddUser} />

        {confirmation && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <p className="mb-4">{confirmation.message}</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setConfirmation(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    confirmation.onConfirm();
                    setConfirmation(null);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;