import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(214.3 31.8% 91.4%)', // slate-200
        input: 'hsl(214.3 31.8% 91.4%)', // slate-200
        ring: 'hsl(221.2 83.2% 53.3%)', // blue-500
        background: 'hsl(0 0% 100%)', // white
        foreground: 'hsl(222.2 84% 4.9%)', // slate-900
        primary: {
          DEFAULT: 'hsl(221.2 83.2% 53.3%)', // blue-500
          foreground: 'hsl(210 40% 98%)', // white
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96%)', // slate-100
          foreground: 'hsl(222.2 84% 4.9%)', // slate-900
        },
        destructive: {
          DEFAULT: 'hsl(0 84.2% 60.2%)', // red-500
          foreground: 'hsl(210 40% 98%)', // white
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96%)', // slate-100
          foreground: 'hsl(215.4 16.3% 46.9%)', // slate-500
        },
        accent: {
          DEFAULT: 'hsl(210 40% 96%)', // slate-100
          foreground: 'hsl(222.2 84% 4.9%)', // slate-900
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)', // white
          foreground: 'hsl(222.2 84% 4.9%)', // slate-900
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)', // white
          foreground: 'hsl(222.2 84% 4.9%)', // slate-900
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
export default config