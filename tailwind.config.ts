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
          // Primary uses muted-teal, readable on honeydew
          primary: 'rgba(115, 186, 155, 1)',
          'on-primary': 'rgba(213, 242, 227, 1)',
          'primary-container': 'rgba(0, 62, 31, 1)',
          'on-primary-container': 'rgba(213, 242, 227, 1)',

          // Secondary uses brick-ember accent
          secondary: 'rgba(186, 45, 11, 1)',
          'on-secondary': 'rgba(213, 242, 227, 1)',
          'secondary-container': 'rgba(0, 62, 31, 1)',
          'on-secondary-container': 'rgba(213, 242, 227, 1)',

          // Tertiary reuses teal for success
          tertiary: 'rgba(115, 186, 155, 1)',
          'on-tertiary': 'rgba(213, 242, 227, 1)',
          'tertiary-container': 'rgba(0, 62, 31, 1)',
          'on-tertiary-container': 'rgba(213, 242, 227, 1)',

          // Error mapped to ember shades
          error: 'rgba(186, 45, 11, 1)',
          'on-error': 'rgba(213, 242, 227, 1)',
          'error-container': 'rgba(186, 45, 11, 0.18)',
          'on-error-container': 'rgba(213, 242, 227, 1)',

          // Surfaces and background
          background: 'rgba(1, 17, 10, 1)',
          'on-background': 'rgba(213, 242, 227, 1)',
          surface: 'rgba(1, 17, 10, 1)',
          'on-surface': 'rgba(213, 242, 227, 1)',
          'surface-variant': 'rgba(0, 62, 31, 1)',
          'on-surface-variant': 'rgba(213, 242, 227, 0.9)',
          outline: 'rgba(115, 186, 155, 0.45)',
          'outline-variant': 'rgba(0, 62, 31, 1)',
          'surface-container-lowest': 'rgba(1, 17, 10, 1)',
          'surface-container-low': 'rgba(0, 62, 31, 1)',
          'surface-container': 'rgba(0, 62, 31, 1)',
          'surface-container-high': 'rgba(0, 62, 31, 1)',
          'surface-container-highest': 'rgba(0, 62, 31, 1)',
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
