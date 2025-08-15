'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Search, User, Sun, Moon, Building2, Users, UserCheck, Upload, Home, BarChart3, ChevronRight, LogOut, Map } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../contexts/auth-context'

// Enhanced Header Component
interface HeaderProps {
  onMobileMenuToggle: () => void
  isMobileMenuOpen?: boolean
  className?: string
}

function Header({ onMobileMenuToggle, isMobileMenuOpen, className }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const { logout, user } = useAuth()

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  return (
    <header className={`sticky top-0 z-30 w-full border-b border-gray-200/20 dark:border-gray-800/20 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl ${className}`}>
      {/* Gradient border effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
      
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        
        {/* Left section */}
        <div className="flex items-center gap-6 flex-1">
          
          {/* Mobile menu button with enhanced animation */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 active:scale-95"
            aria-label="Toggle mobile menu"
          >
            <div className="relative">
              <Menu className={`h-4 w-4 transition-all duration-500 ${
                isMobileMenuOpen ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              } absolute inset-0`} />
              <X className={`h-4 w-4 transition-all duration-500 ${
                isMobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
              } absolute inset-0`} />
            </div>
          </button>

          {/* Enhanced search bar */}
          <div className="relative max-w-md w-full hidden md:block">
            <div className={`
              relative flex items-center transition-all duration-500 ease-out
              ${isSearchFocused ? 'scale-105' : 'scale-100'}
            `}>
              <Search className={`
                absolute left-3 h-4 w-4 transition-all duration-300
                ${isSearchFocused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}
              `} />
              <input
                type="text"
                placeholder="Search companies, students, branches..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`
                  w-full h-10 pl-10 pr-4 
                  bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-xl 
                  border border-gray-200/60 dark:border-gray-800/60 rounded-xl
                  text-sm text-gray-900 dark:text-gray-100 
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  transition-all duration-500 ease-out
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
                  hover:bg-gray-100/80 dark:hover:bg-gray-800/80
                  ${isSearchFocused 
                    ? 'border-blue-500/50 bg-white/90 dark:bg-gray-800/90 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/10' 
                    : ''
                  }
                `}
              />
              
              {/* Search glow effect */}
              {isSearchFocused && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl -z-10 animate-pulse"></div>
              )}
            </div>
            
            {/* Enhanced search suggestions */}
            {isSearchFocused && (
              <div className="absolute top-12 left-0 right-0 bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-800/60 rounded-xl shadow-2xl backdrop-blur-2xl z-50 p-3 animate-in slide-in-from-top-2 duration-300">
                <div className="text-xs text-gray-500 dark:text-gray-400 p-2 border-l-2 border-blue-500/30">
                  <span className="font-medium text-blue-600 dark:text-blue-400">Quick Search:</span> Start typing to find companies, students, or branches...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section with enhanced styling */}
        <div className="flex items-center gap-3">
          
          {/* Mobile search */}
          <button className="md:hidden group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95">
            <Search className="h-4 w-4" />
          </button>

          {/* Enhanced logout button (replaces notifications) */}
          <button 
            onClick={handleLogout}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200/60 dark:border-red-800/60 bg-white/80 dark:bg-gray-900/80 text-red-600 dark:text-red-400 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:scale-105 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-95"
            title="Logout"
          >
            <LogOut className="h-4 w-4 group-hover:animate-pulse" />
          </button>

          {/* Enhanced theme toggle */}
          <button 
            onClick={toggleTheme}
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
          >
            <Sun className={`h-4 w-4 transition-all duration-500 ${isDark ? 'rotate-180 scale-0' : 'rotate-0 scale-100'} absolute`} />
            <Moon className={`h-4 w-4 transition-all duration-500 ${isDark ? 'rotate-0 scale-100' : 'rotate-180 scale-0'} absolute`} />
          </button>

          {/* Enhanced user menu */}
          <div className="relative">
            <button className="group flex items-center gap-3 p-2 pr-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center text-white shadow-lg ring-2 ring-blue-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 opacity-20 blur group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user?.email || 'User'
                  }
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, description: 'Overview & insights', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Companies', href: '/companies', icon: Building2, description: 'Partner organizations', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Branches', href: '/branches', icon: UserCheck, description: 'Branch locations', gradient: 'from-green-500 to-green-600' },
  { name: 'Students', href: '/students', icon: Users, description: 'Student management', gradient: 'from-orange-500 to-orange-600' },
  { name: 'Import Data', href: '/import', icon: Upload, description: 'Data import tools', gradient: 'from-pink-500 to-pink-600' },
  { name: 'Map', href: '/map', icon: Map, description: 'Companies location', gradient: 'from-indigo-600 to-purple-600' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Reports & analytics', gradient: 'from-teal-500 to-cyan-600' },
]

function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const pathname = usePathname() || '/'
    const { logout, user, tenant } = useAuth()
  
    const handleLogout = () => {
      if (window.confirm('Are you sure you want to logout?')) {
        logout()
      }
    }
  
    return (
      <>
        {/* Mobile overlay with enhanced backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm transition-all duration-300"
            onClick={onClose}
          />
        )}
  
        {/* Enhanced Sidebar with optimized spacing */}
        <aside
          data-sidebar
          className={`
            fixed top-0 left-0 z-50 h-screen w-72 transform
            bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl
            border-r border-gray-200/30 dark:border-gray-800/30
            transition-all duration-500 ease-out
            lg:translate-x-0 lg:relative lg:top-0
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            shadow-2xl lg:shadow-xl
          `}
        >
          <div className="flex h-full flex-col">
  
            {/* Enhanced Header Section - Reduced padding */}
            <div className="flex-shrink-0 p-5 border-b border-gray-200/30 dark:border-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center shadow-xl ring-2 ring-blue-500/20 transition-all duration-300 group-hover:scale-105">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 opacity-20 blur-lg group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                {/* MODIFICATION START */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent break-words">
                    {tenant?.company_name || 'Student Management System'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium break-words">
                    {user?.role === 'super_admin' ? 'Super Admin Portal' : 'Professional Edition'}
                  </p>
                </div>
                {/* MODIFICATION END */}
              </div>
            </div>
  
            {/* Enhanced Navigation - Optimized spacing */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navigation.map((item, index) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link key={item.name} href={item.href} onClick={onClose}>
                      <div className={`
                        group relative flex items-center gap-3 px-4 py-3 text-sm font-medium
                        rounded-2xl transition-all duration-300 transform
                        ${isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl shadow-blue-500/20 scale-[1.02] ring-1 ring-white/20`
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/80 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01] hover:shadow-lg'
                        }
                      `}>
  
                        {/* Enhanced Icon with gradient background */}
                        <div className={`
                          relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 flex-shrink-0
                          ${isActive
                            ? 'bg-white/20 shadow-lg'
                            : `bg-gradient-to-br ${item.gradient} text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 shadow-lg`
                          }
                        `}>
                          <item.icon className="w-4 h-4" />
                          {!isActive && (
                            <div className={`absolute -inset-0.5 rounded-xl bg-gradient-to-br ${item.gradient} opacity-20 blur group-hover:opacity-30 transition-opacity duration-300`}></div>
                          )}
                        </div>
  
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          <div className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.description}
                          </div>
                        </div>
  
                        {/* Enhanced Arrow */}
                        <ChevronRight className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ${
                          isActive
                            ? 'opacity-100 transform rotate-0 text-white/80'
                            : 'opacity-0 group-hover:opacity-60 transform translate-x-1 group-hover:translate-x-0 text-gray-400'
                        }`} />
  
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full"></div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </nav>
  
            {/* User Info and Logout Section - Compact design */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200/30 dark:border-gray-800/30 space-y-3">
  
              {/* User Info - Compact */}
              <div className="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.email || 'User'
                    }
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                  </div>
                </div>
              </div>
  
              {/* Logout Button - Compact */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl border border-red-200/50 dark:border-red-800/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-300 flex-shrink-0">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-sm">Logout</div>
                  <div className="text-xs text-red-500/80 dark:text-red-400/80 truncate">Sign out of account</div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
              </button>
            </div>
          </div>
        </aside>
      </>
    )
  }

// Enhanced Client Layout Component with Proper Dialog Portal
interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (sidebarOpen && !isLargeScreen) {
      const handleClickOutside = (e: MouseEvent) => {
        const sidebar = document.querySelector('[data-sidebar]')
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setSidebarOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen, isLargeScreen])

  return (
    <>
      {/* Main App Container */}
      <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex overflow-hidden">
        
        {/* Sidebar - Fixed positioning */}
        <div className={`${isLargeScreen ? 'w-72 flex-shrink-0' : ''}`}>
          <Sidebar 
            isOpen={sidebarOpen || isLargeScreen} 
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* Main content area - Flexible and scrollable */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Header - Fixed at top */}
          <Header 
            onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            isMobileMenuOpen={sidebarOpen}
          />
          
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto relative">
            
            {/* Enhanced background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent via-50% to-indigo-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-indigo-950/10 pointer-events-none" />
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />
            
            {/* Main content */}
            <main className="relative z-10 min-h-full p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Dialog Portal Container - This ensures dialogs appear above everything */}
      <div id="dialog-portal-root" className="relative z-[100]" />
    </>
  )
}

// Sample Dashboard Content for Testing
export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back to your student management system</p>
        </div>
      </div>

      {/* Sample cards for scrolling demonstration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg mb-4`}>
              <div className="text-lg font-bold">{i + 1}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Card {i + 1}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
              This is sample content to demonstrate the scrolling behavior of the dashboard area while keeping the sidebar fixed.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  return (
    <div className="font-sans">
      <ClientLayout>
        <DashboardContent />
      </ClientLayout>
    </div>
  )
}