'use client'

import { useState } from 'react'
import { Menu, X, Bell, Search, User, Settings } from 'lucide-react'
import { ThemeToggle } from '../theme/theme-toggle'

interface HeaderProps {
  onMobileMenuToggle: () => void
  isMobileMenuOpen?: boolean
  className?: string
}

export function Header({ onMobileMenuToggle, isMobileMenuOpen, className }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl ${className}`}>
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        
        {/* Left section - Mobile menu & Search */}
        <div className="flex items-center gap-6 flex-1">
          
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Toggle mobile menu"
          >
            <Menu className={`h-5 w-5 transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-180 scale-0' : 'rotate-0 scale-100'
            } absolute`} />
            <X className={`h-5 w-5 transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-0 scale-100' : 'rotate-180 scale-0'
            } absolute`} />
          </button>

          {/* Search bar */}
          <div className="relative max-w-sm w-full hidden md:block">
            <div className={`
              relative flex items-center transition-all duration-300
              ${isSearchFocused ? 'scale-105' : 'scale-100'}
            `}>
              <Search className={`
                absolute left-3 h-4 w-4 transition-colors duration-200
                ${isSearchFocused ? 'text-blue-600' : 'text-gray-400'}
              `} />
              <input
                type="text"
                placeholder="Search anything..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`
                  w-full h-10 pl-10 pr-4 
                  bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm 
                  border border-gray-200 dark:border-gray-800 rounded-xl
                  text-sm text-gray-900 dark:text-gray-100 
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  hover:bg-gray-100/50 dark:hover:bg-gray-800/50
                  ${isSearchFocused 
                    ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-lg shadow-blue-500/10' 
                    : ''
                  }
                `}
              />
            </div>
            
            {/* Search suggestions */}
            {isSearchFocused && (
              <div className="absolute top-12 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl backdrop-blur-xl z-50 p-3 animate-in slide-in-from-top-2 duration-200">
                <div className="text-xs text-gray-500 dark:text-gray-400 p-2">
                  Start typing to search companies, students, or branches...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section - Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Mobile search */}
          <button className="md:hidden relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </button>

          {/* Settings */}
          <button className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="relative">
            <button className="group flex items-center gap-3 p-2 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left text-sm">
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">System Administrator</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}