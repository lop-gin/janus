'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, inviteUser } from '@/lib/supabase';

export default function InviteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    roleId: '',
  });

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.profile?.companies) {
          setCompanyId(user.profile.companies.id);
          
          // In a real implementation, we would fetch roles from the database
          // For now, we'll use dummy data
          setRoles([
            { id: '1', name: 'Admin' },
            { id: '2', name: 'Sales Supervisor' },
            { id: '3', name: 'Sales Rep' },
            { id: '4', name: 'Procurement Supervisor' },
            { id: '5', name: 'Procurement Rep' },
            { id: '6', name: 'Production Supervisor' },
            { id: '7', name: 'Machine Operator' },
            { id: '8', name: 'Packaging Supervisor' },
            { id: '9', name: 'Packaging Person' },
            { id: '10', name: 'Transport Supervisor' },
            { id: '11', name: 'Transport Person' },
            { id: '12', name: 'Store Supervisor' },
            { id: '13', name: 'Store Person' },
          ]);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserAndRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId) {
      setError('Company information not available');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setInvitationLink(null);

    try {
      const result = await inviteUser(formData.email, formData.roleId, companyId);
      setSuccess(true);
      setInvitationLink(result.invitationLink);
      setFormData({ email: '', roleId: '' });
    } catch (err) {
      console.error('Invite user error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while sending the invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Invite Team Member</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Invitation has been sent successfully!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {invitationLink && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700 mb-2">
                Share this invitation link with the team member:
              </p>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={invitationLink}
                  className="flex-1 p-2 text-xs border rounded-md bg-gray-50"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  className="ml-2 p-2 text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    navigator.clipboard.writeText(invitationLink);
                    alert('Link copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="colleague@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="roleId"
            name="roleId"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.roleId}
            onChange={handleChange}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Sending invitation...' : 'Send Invitation'}
        </button>
      </form>
    </div>
  );
}
