'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-provider';

interface HeaderBarProps {
  pageTitle?: string;
}

export default function HeaderBar({ pageTitle }: HeaderBarProps) {
  const { user } = useAuth();
  
  // Mock data for organization and roles - in a real app, these would come from the user object
  const organization = user?.profile?.company_name || 'Your Company';
  const roles = user?.profile?.roles || [
    { id: '1', name: 'Admin', color: 'bg-purple-100 text-purple-800' },
    { id: '2', name: 'Sales Supervisor', color: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {pageTitle || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{organization}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span 
                  key={role.id} 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}
                >
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
