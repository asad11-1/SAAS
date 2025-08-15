import { VMTAHeader } from '../ui/vmta-header';
import { VMTAFooter } from '../ui/vmta-footer';
import { ReactNode } from 'react';

interface PlatformLayoutProps {
  children: ReactNode;
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  tenantName?: string;
  showFooter?: boolean;
}

export function PlatformLayout({ 
  children, 
  user, 
  tenantName, 
  showFooter = true 
}: PlatformLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* VMTA Header - Always visible */}
      <VMTAHeader user={user} tenantName={tenantName} />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* VMTA Footer - Always visible */}
      {showFooter && <VMTAFooter />}
    </div>
  );
}