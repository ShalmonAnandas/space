import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // MD3 color classes
    'bg-md-primary',
    'bg-md-primary-container',
    'bg-md-secondary-container',
    'bg-md-tertiary-container',
    'bg-md-error-container',
    'bg-md-surface-container-high',
    'bg-md-surface-container-highest',
    'text-md-on-primary-container',
    'text-md-on-secondary-container',
    'text-md-on-tertiary-container',
    'text-md-on-error-container',
    'text-md-primary',
    'text-md-tertiary',
    'border-md-outline-variant',
    'border-md-outline',
    'border-md-primary',
    'border-md-secondary',
    'border-md-tertiary',
    'border-md-error',
  ],
  theme: {
    extend: {
      colors: {
        // Dark palette mapped to MD tokens
        md: {
          // Retro pastel on dark
          // Primary: pastel teal
          primary: '#7CD7C7',
          'on-primary': '#0B0F14',
          'primary-container': '#15313A',
          'on-primary-container': '#B4FFF1',

          // Secondary: pastel pink
          secondary: '#FFB3C7',
          'on-secondary': '#0B0F14',
          'secondary-container': '#3A2437',
          'on-secondary-container': '#FFD8E8',

          // Tertiary: lavender
          tertiary: '#C5B5FF',
          'on-tertiary': '#0B0F14',
          'tertiary-container': '#2D2745',
          'on-tertiary-container': '#E9E3FF',

          // Error: soft coral
          error: '#FF7777',
          'on-error': '#0B0F14',
          'error-container': 'rgba(255, 119, 119, 0.18)',
          'on-error-container': '#FFDADA',

          // Surfaces and background
          background: '#0B0F14',
          'on-background': '#E8EEF4',
          surface: '#121825',
          'on-surface': '#E8EEF4',
          'surface-variant': '#1B2334',
          'on-surface-variant': 'rgba(232, 238, 244, 0.85)',
          outline: 'rgba(93, 107, 138, 0.5)',
          'outline-variant': '#1B2334',
          'surface-container-lowest': '#0B0F14',
          'surface-container-low': '#151B2A',
          'surface-container': '#1B2334',
          'surface-container-high': '#212A3D',
          'surface-container-highest': '#27324A',
        },
      },
      borderRadius: {
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
