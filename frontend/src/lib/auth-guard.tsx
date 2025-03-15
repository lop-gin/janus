'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-provider';

// List of paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/accept-invitation',
];

export default function AuthGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
      
      if (!user && !isPublicPath) {
        // Redirect to login if user is not authenticated and trying to access a protected route
        router.push('/auth/login');
      } else if (user && isPublicPath) {
        // Redirect to dashboard if user is authenticated and trying to access an auth route
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if we should render the children based on authentication status and current path
  const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
  if ((user && !isPublicPath) || (!user && isPublicPath)) {
    return <>{children}</>;
  }

  // Return null during redirects
  return null;
}
