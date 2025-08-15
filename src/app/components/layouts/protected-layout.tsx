'use client';

import { useAuth } from '../../contexts/auth-context';
import { ClientLayout } from './client-layout';
import LoginPage from '../../login/page';
import { Activity } from 'lucide-react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="text-center space-y-6 animate-pulse">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center mx-auto">
              <Activity className="w-10 h-10 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Loading VMTA System</h3>
            <p className="text-gray-500 dark:text-gray-400">Verifying your session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show the main layout with sidebar for authenticated users
  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
}