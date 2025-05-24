'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner'; 
import Button from '@/components/ui/Button'; // Assuming Button component for pagination

// Define interfaces for the data
interface ActivityLog {
  id: number;
  company_id: number;
  user_id: number;
  user_email?: string | null;
  user_name?: string | null;
  activity_type: string;
  entity_type?: string | null;
  entity_id?: number | null;
  description: string;
  created_at: string; // Assuming ISO string format from backend
}

interface PaginatedResponse {
  items: ActivityLog[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

const ITEMS_PER_PAGE = 15; // Or make this configurable

export default function ActivityLogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // For initial page load auth check
  const [isDataLoading, setIsDataLoading] = useState(false); // For data fetching
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Optional Filters State - Deferred for now
  // const [userIdFilter, setUserIdFilter] = useState('');
  // const [activityTypeFilter, setActivityTypeFilter] = useState('');

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/signin');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Auth check finished
  }, [router]);

  const fetchActivityLogs = useCallback(async (page: number) => {
    if (!isAuthenticated) return; // Don't fetch if not authenticated

    setIsDataLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');

    // Build query parameters
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(ITEMS_PER_PAGE),
    });
    // Optional Filters - Deferred
    // if (userIdFilter) params.append('userId', userIdFilter);
    // if (activityTypeFilter) params.append('activityType', activityTypeFilter);

    try {
      const response = await fetch(`/api/v1/activity-logs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError("Authentication failed. Please sign in again.");
          localStorage.removeItem('accessToken');
          localStorage.removeItem('currentUser');
          router.replace('/signin');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch activity logs.');
      }

      const data: PaginatedResponse = await response.json();
      setActivityLogs(data.items);
      setTotalPages(data.pages);
      setTotalItems(data.total);
      setCurrentPage(data.page);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDataLoading(false);
    }
  }, [isAuthenticated, router /*, userIdFilter, activityTypeFilter */ ]); // Add filters if implemented

  // Fetch logs when page loads or current page changes
  useEffect(() => {
    if (isAuthenticated) { // Only fetch if authenticated
      fetchActivityLogs(currentPage);
    }
  }, [isAuthenticated, currentPage, fetchActivityLogs]);


  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Combined loading state for initial auth check
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <Spinner size="lg" />
        <p className="mt-4 text-lg">Loading Activity Log...</p>
      </div>
    );
  }

  // If auth check is done and user is not authenticated (should have been redirected, but as a fallback)
  if (!isAuthenticated) {
    return null; 
  }
  
  // Main content rendering
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 animate-fadeIn">
      <header className="mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-bold text-orange-500">Activity Log</h1>
        <p className="text-lg text-gray-400 mt-1">
          Track system events and user activities within your company.
        </p>
      </header>

      {/* TODO: Add Filter UI (Deferred) */}

      {isDataLoading && !activityLogs.length ? ( // Show spinner only if loading and no data yet
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-800/30 border border-red-700 text-red-300 p-4 rounded-lg text-center">
          <p>Error loading activity logs: {error}</p>
          <Button onClick={() => fetchActivityLogs(currentPage)} variant="secondary" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : activityLogs.length === 0 ? (
        <div className="text-center py-10 bg-gray-800 p-6 rounded-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="mt-4 text-2xl font-semibold text-gray-300">No Activities Recorded Yet</h2>
          <p className="mt-2 text-gray-500">System and user activities will appear here once they are generated.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-gray-800 shadow-xl rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-300 tracking-wider">Timestamp</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-300 tracking-wider">User</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-300 tracking-wider">Activity Type</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-300 tracking-wider">Description</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-sm font-semibold text-gray-300 tracking-wider">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/70">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/60 transition-colors duration-150">
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">{formatTimestamp(log.created_at)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.user_name || log.user_email || `User ID: ${log.user_id}`}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-700/50 text-orange-300 border border-orange-600">
                        {log.activity_type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300 max-w-md truncate hover:whitespace-normal" title={log.description}>{log.description}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-400">
                      {log.entity_type && log.entity_id ? `${log.entity_type} (ID: ${log.entity_id})` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
              <div className="mb-4 sm:mb-0">
                Page <span className="font-semibold text-gray-200">{currentPage}</span> of <span className="font-semibold text-gray-200">{totalPages}</span> 
                <span className="mx-2">|</span> 
                Total activities: <span className="font-semibold text-gray-200">{totalItems}</span>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1 || isDataLoading}
                  variant="secondary"
                  className="px-4 py-2"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages || isDataLoading}
                  variant="secondary"
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-10">
        <Link href="/dashboard" legacyBehavior>
          <a className="text-orange-500 hover:text-orange-400 transition-colors duration-200 text-sm">
            &larr; Back to Dashboard
          </a>
        </Link>
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-500 text-sm">
          Recordserp &copy; {new Date().getFullYear()}. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
