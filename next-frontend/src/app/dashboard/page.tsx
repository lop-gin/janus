'use client';

import { useAuth } from "@/lib/auth/AuthContext";

export default function DashboardPage() {
  const { user, session } = useAuth();
  const userMetadata = session?.user?.user_metadata;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to your Dashboard</h1>
        <p className="text-gray-600">
          Hello, {userMetadata?.full_name || user?.email}! This is your personalized dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/dashboard/sales/invoice" className="block text-blue-600 hover:underline">Create Invoice</a>
            <a href="/dashboard/customers/add" className="block text-blue-600 hover:underline">Add Customer</a>
            <a href="/dashboard/sales/estimate" className="block text-blue-600 hover:underline">Create Estimate</a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Recent Activity</h2>
          <p className="text-gray-600">No recent activity to display.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Account Summary</h2>
          <div className="space-y-2">
            <p className="text-gray-600">Company: {userMetadata?.company_name || 'Not specified'}</p>
            <p className="text-gray-600">Type: {userMetadata?.company_type || 'Not specified'}</p>
            <p className="text-gray-600">Email: {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}