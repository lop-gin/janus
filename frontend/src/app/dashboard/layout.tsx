'use client';

import React, { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import HeaderBar from '@/components/HeaderBar';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname() || '';
  
  // Extract the active module from the pathname
  // Format: /dashboard/[module]/[submodule]
  const pathParts = pathname.split('/').filter(Boolean);
  let activeModule = pathParts.length > 1 ? pathParts[1] : 'dashboard';
  
  if (pathParts.length > 2) {
    activeModule = `${pathParts[1]}/${pathParts[2]}`;
  }

  // Convert pathname to title
  const pageTitle = pathname === '/dashboard' 
    ? 'Dashboard' 
    : pathname.split('/').filter(Boolean).slice(1).map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
      ).join(' > ');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderBar pageTitle={pageTitle} />
        
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Manufacturing ERP System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
