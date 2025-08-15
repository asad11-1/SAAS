import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './components/theme/theme-provider'
import { AuthProvider } from './contexts/auth-context'
import { ProtectedLayout } from './components/layouts/protected-layout'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist'
})

export const metadata: Metadata = {
  title: 'VMTA Student Manager - Professional Edition',
  description: 'Modern student and company management system powered by VMTA',
  keywords: ['student management', 'education', 'VMTA', 'professional', 'medical training'],
  authors: [{ name: 'VMTA - Visser Medical Training en Advisering' }],
  viewport: 'width=device-width, initial-scale=1',
  // --- UPDATED FAVICON SECTION ---
  icons: {
    // Points to the logo in your `public` folder
    icon: '/Logo_klein.jpg', 
    shortcut: '/Logo_klein.jpg', // For older browsers
    apple: '/Logo_klein.jpg', // For Apple devices
  },
  // --- END OF UPDATE ---
  openGraph: {
    title: 'VMTA Student Manager',
    description: 'Professional student and company management system',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geist.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <ProtectedLayout>
              {children}
            </ProtectedLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}