'use client';

import { useAuth } from "@/lib/auth/AuthContext";
import { redirect } from "next/navigation";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { user, isLoading } = useAuth();

  // // Redirect if not authenticated
  // if (!isLoading && !user) {
  //   redirect('/auth/login');
  // }

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