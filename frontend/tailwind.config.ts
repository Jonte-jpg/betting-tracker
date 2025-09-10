// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    // Bet status color classes - backgrounds
    'bg-green-50', 'bg-green-100', 'bg-red-50', 'bg-red-100', 
    'bg-yellow-50', 'bg-yellow-100', 'bg-blue-50', 'bg-blue-100',
    // Important variants for specificity
    '!bg-green-50', '!bg-green-100', '!bg-red-50', '!bg-red-100',
    '!bg-yellow-50', '!bg-yellow-100', '!bg-blue-50', '!bg-blue-100',
    // Bet status color classes - borders
    'border-green-200', 'border-green-300', 'border-green-400',
    'border-red-200', 'border-red-300', 'border-red-400',
    'border-yellow-200', 'border-yellow-300', 'border-yellow-400',
    'border-blue-200', 'border-blue-300', 'border-blue-400',
    'border-gray-400',
    // Important border variants
    '!border-green-400', '!border-red-400', '!border-yellow-400', '!border-blue-400',
    // Bet status color classes - text
    'text-green-800', 'text-red-800', 'text-yellow-800', 'text-blue-800', 
    'text-black', 'text-gray-600', 'text-gray-700', 'text-gray-800',
    // Hover states
    'hover:bg-green-100', 'hover:bg-red-100', 'hover:bg-yellow-100', 'hover:bg-blue-100',
    'hover:!bg-green-100', 'hover:!bg-red-100', 'hover:!bg-yellow-100', 'hover:!bg-blue-100',
    // Border left indicators for table rows
    'border-l-4', 'border-l-green-400', 'border-l-red-400', 'border-l-yellow-400', 'border-l-blue-400'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
} satisfies Config