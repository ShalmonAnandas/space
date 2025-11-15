import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFB3D9',
          'pink-light': '#FFD6EC',
          purple: '#D4A5FF',
          'purple-light': '#E8D4FF',
          blue: '#A5D8FF',
          'blue-light': '#D4EEFF',
          green: '#B3FFB3',
          'green-light': '#DAFFD4',
          yellow: '#FFF4A3',
          'yellow-light': '#FFFAD4',
          peach: '#FFCBA4',
          'peach-light': '#FFE5D4',
          lavender: '#E0BBE4',
          mint: '#C7CEEA',
          cream: '#FFDFD3',
          rose: '#FEC8D8',
        },
        retro: {
          dark: '#5D4E6D',
          medium: '#8B7E99',
          light: '#B8AEC5',
        },
      },
      fontFamily: {
        retro: ['Comic Sans MS', 'cursive'],
      },
      borderRadius: {
        'retro': '20px',
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0,0,0,0.1)',
        'retro-lg': '8px 8px 0px 0px rgba(0,0,0,0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
