import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'shadow-elevated',
    'bg-surface-strong',
    'bg-surface-soft',
    'border-surface-border',
    'text-accent-soft',
    'text-accent-strong',
    'animate-shimmer',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          base: '#0C0F16',
          muted: '#10131C',
        },
        surface: {
          soft: 'rgba(34, 39, 51, 0.72)',
          strong: 'rgba(27, 32, 45, 0.88)',
          border: 'rgba(118, 132, 168, 0.28)',
          highlight: 'rgba(59, 68, 94, 0.64)',
        },
        accent: {
          soft: '#7C8FFF',
          strong: '#9AB0FF',
          vivid: '#5F72EB',
        },
        positive: '#6FC5A6',
        warning: '#E3B964',
        danger: '#F17E7E',
        neutral: {
          100: '#F5F7FA',
          200: '#D9DEE8',
          300: '#B0B7C7',
          400: '#8A93A8',
          500: '#6A748B',
          600: '#4E566B',
          700: '#3A4153',
          800: '#282E3C',
          900: '#1C212D',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '18px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        elevated: '0 18px 40px -25px rgba(14, 18, 28, 0.75)',
      },
      backdropBlur: {
        xs: '6px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
