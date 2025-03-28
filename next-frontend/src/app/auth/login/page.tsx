'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/ui/loading-animation";

// Logo component with simplified styling
export const NexusForgeLogoLink = () => (
  <Link href="/" className="inline-block">
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xl font-bold">NF</span>
      </div>
      <span className="text-2xl font-bold text-blue-600">
        NexusForge
      </span>
    </div>
  </Link>
);

export default function LoginPage() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      // AuthContext will handle redirection
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to sign in');
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with logo */}
      <header className="w-full py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <NexusForgeLogoLink />
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-md w-full p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to your NexusForge account
            </p>
          </div>
          
          {isLoading ? (
            <div className="py-12">
              <LoadingAnimation size="medium" />
              <p className="text-center mt-4 text-gray-600">Signing you in...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
