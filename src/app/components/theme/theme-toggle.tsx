'use client'

import * as React from 'react'
import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
    )
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm text-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover-lift"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
      } absolute`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
      } absolute`} />
      <Laptop className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        theme === 'system' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'
      } absolute`} />
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {theme === 'light' ? 'Light mode' : theme === 'dark' ? 'Dark mode' : 'System'}
      </span>
    </button>
  )
}