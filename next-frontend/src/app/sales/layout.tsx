'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client'; // Adjust the import path as needed
import { useAuth } from "@/lib/auth/AuthContext";
import { redirect } from "next/navigation";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Store the token in localStorage when a user is logged in
        localStorage.setItem("supabase.auth.token", session.access_token);
      } else {
        // Remove the token when the user logs out
        localStorage.removeItem("supabase.auth.token");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Redirect if not authenticated
  if (!isLoading && !user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 p-0">
        <div className="mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}