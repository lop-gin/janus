"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { SignUpProvider } from '@/context/SignUpContext'; // Using alias

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return (
    <SignUpProvider>
      <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
        {/* Simple Header */}
        <header className="py-5 px-4 md:px-8 bg-gray-800 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" legacyBehavior>
              <a className="text-3xl font-bold text-orange-500 hover:text-orange-400 transition-colors">
                Recordserp
              </a>
            </Link>
            {/* Could add a progress bar here later */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg space-y-8">
            {children}
          </div>
        </main>

        {/* Simple Footer */}
        <footer className="py-6 text-center bg-gray-800 border-t border-gray-700">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Recordserp. All rights reserved.</p>
        </footer>
      </div>
    </SignUpProvider>
  );
}
