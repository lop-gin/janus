'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import NewActionMenu from '@/components/dashboard/NewActionMenu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasPermission } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const newButtonRef = useRef<HTMLButtonElement>(null);

  // Redirect if not authenticated
  if (!isLoading && !user) {
    redirect('/auth/login');
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNewMenu = () => {
    setNewMenuOpen(!newMenuOpen);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        toggle={toggleSidebar}
        toggleNewMenu={toggleNewMenu}
        hasPermission={hasPermission}
      />

      {/* Main content */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '14rem' : '0' }}
      >
        <DashboardHeader sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* New action menu popup */}
        {newMenuOpen && (
          <NewActionMenu
            isOpen={newMenuOpen}
            onClose={() => setNewMenuOpen(false)}
            sidebarOpen={sidebarOpen}
            buttonRef={newButtonRef}
          />
        )}

        <main className="flex-1 p-6">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}