'use client'

import { Building2, Users, UserCheck, Upload, Home, BarChart3, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, description: 'Overview & insights' },
  { name: 'Companies', href: '/companies', icon: Building2, description: 'Partner organizations' },
  { name: 'Branches', href: '/branches', icon: UserCheck, description: 'Branch locations' },
  { name: 'Students', href: '/students', icon: Users, description: 'Student management' },
  { name: 'Import Data', href: '/import', icon: Upload, description: 'Data import tools' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Reports & analytics' },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        data-sidebar
        className={`
          fixed top-0 left-0 z-50 h-screen w-80 transform
          bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl 
          border-r border-gray-200/50 dark:border-gray-800/50
          transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:relative lg:top-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-2xl lg:shadow-lg
        `}
      >
        <div className="flex h-full flex-col">
          
          {/* Header Section - Fixed */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 opacity-20 blur"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Manager</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Professional Edition</p>
              </div>
            </div>
          </div>

          {/* Navigation - Fixed, no scroll needed */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
                    <div className={`
                      group relative flex items-center gap-3 px-4 py-3.5 text-sm font-medium 
                      rounded-2xl transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white hover:scale-[1.01]'
                      }
                    `}>
                      
                      {/* Icon */}
                      <div className={`
                        w-6 h-6 flex items-center justify-center transition-transform duration-200
                        ${isActive ? '' : 'group-hover:scale-110'}
                      `}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{item.name}</div>
                        <div className={`text-xs opacity-75`}>
                          {item.description}
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                        isActive 
                          ? 'opacity-100 transform rotate-0' 
                          : 'opacity-0 group-hover:opacity-60 transform translate-x-1 group-hover:translate-x-0'
                      }`} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* VMTA Branding Section - Fixed at bottom */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/50 dark:border-blue-800/50 p-5">
              
              {/* Background decoration */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <Image
                      src="/Logo_klein.jpg"
                      alt="VMTA Logo"
                      width={20}
                      height={20}
                      className="rounded-sm"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">VMTA System</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Professional Medical Training</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Active</span>
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">System Status</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-blue-700 dark:text-blue-300 font-medium">v1.0.0</div>
                    <div className="text-blue-600 dark:text-blue-400">Version</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}