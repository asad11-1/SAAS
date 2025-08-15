'use client';

import { VMTALogo } from './vmta-logo';
import { Bell, User, Menu, LogOut } from 'lucide-react';

interface VMTAHeaderProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
  tenantName?: string;
  showClientInfo?: boolean;
}

export function VMTAHeader({ user, tenantName, showClientInfo = true }: VMTAHeaderProps) {
  const isVMTATenant = tenantName === 'Visser Medical Training en Advisering';

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: VMTA Logo (always visible) */}
          <div className="flex items-center gap-6">
            <VMTALogo variant="header" size="md" />
            
            {/* Client Info (if not VMTA tenant) */}
            {showClientInfo && !isVMTATenant && tenantName && (
              <div className="border-l border-gray-300 pl-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Client</span>
                    <p className="font-semibold text-gray-900">{tenantName}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: User menu */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-vmta-blue rounded-lg hover:bg-blue-50 transition-colors">
              <Bell size={20} />
            </button>
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
                <div className="w-8 h-8 bg-vmta-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}