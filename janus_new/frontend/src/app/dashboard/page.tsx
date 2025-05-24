'use client'; // Required for useEffect and useRouter

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner'; // Ensure this path is correct

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const currentUserData = localStorage.getItem('currentUser');

    if (!token) {
      router.replace('/signin');
    } else {
      setIsAuthenticated(true);
      if (currentUserData) {
        try {
          const user = JSON.parse(currentUserData);
          // Assuming user object has a 'name' or 'email' field.
          // For example, if user.email exists:
          setUserName(user.email || "User"); 
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          setUserName("User");
        }
      } else {
        setUserName("User");
      }
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  // This check is technically redundant due to the router.replace in useEffect,
  // but it's good for explicitness and handles any brief moment before redirect completes.
  if (!isAuthenticated) {
    return null; 
  }

  // Navigation items
  const navItems = [
    { href: '/users', title: 'User Management', description: 'Manage users, their roles, and invitations.' },
    { href: '/roles', title: 'Role Management', description: 'Define roles and assign permissions.' },
    { href: '/activity-log', title: 'Activity Log', description: 'View system events and user activities.' },
    // Add more items here as needed, e.g., Company Settings, Profile
    { href: '/settings/company', title: 'Company Settings', description: 'Manage your company profile and settings.' },
    { href: '/settings/profile', title: 'My Profile', description: 'Update your personal information.' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 animate-fadeIn">
      {/* Header Section */}
      <header className="mb-10 pb-6 border-b border-gray-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 mb-2">
          Recordserp Dashboard
        </h1>
        <p className="text-xl text-gray-300">
          Welcome back, <span className="font-semibold text-orange-400">{userName || "User"}</span>!
        </p>
        <p className="text-md text-gray-400 mt-1">
          Oversee and manage your operations from here.
        </p>
      </header>

      {/* Navigation Links Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href} legacyBehavior>
            <a className="group block p-6 bg-gray-800 rounded-xl shadow-2xl hover:bg-gray-700/80 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-orange-500/30">
              <h2 className="text-2xl font-semibold text-orange-500 group-hover:text-orange-400 transition-colors mb-2">
                {item.title}
              </h2>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm">
                {item.description}
              </p>
            </a>
          </Link>
        ))}
      </section>

      {/* Placeholder for future content/widgets */}
      {/* 
      <section className="mt-12">
        <h2 className="text-3xl font-semibold text-gray-100 mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-orange-500">Active Users</h3>
            <p className="text-3xl text-gray-100 mt-2">125</p> 
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-orange-500">Open Orders</h3>
            <p className="text-3xl text-gray-100 mt-2">34</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-orange-500">Items in Stock</h3>
            <p className="text-3xl text-gray-100 mt-2">1,280</p>
          </div>
        </div>
      </section>
      */}

      {/* Footer or additional links */}
      <footer className="mt-16 pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-500 text-sm">
          Recordserp &copy; {new Date().getFullYear()}. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
