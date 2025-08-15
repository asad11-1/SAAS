import Image from 'next/image'

export function VMTAFooter() {
  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* VMTA Branding */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Image
                  src="/Logo_dwars.png"
                  alt="VMTA Logo"
                  width={140}
                  height={45}
                  className="object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">VMTA</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visser Medical Training en Advisering</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Professional Medical Training Solutions</p>
              </div>
            </div>
            
            {/* Links & Info */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Support
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Documentation
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy
                </a>
              </div>
              
              {/* Copyright */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
                <p className="font-medium">Student Manager v1.0.0</p>
                <p>© {new Date().getFullYear()} VMTA. All rights reserved</p>
              </div>
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 dark:text-gray-500">
              <p>Powered by modern web technologies for optimal performance</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}