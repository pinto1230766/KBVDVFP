/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3F5173',
          dark: '#344462',
          light: '#A5B4D2'
        },
        secondary: '#4E3562',
        light: '#F0F2F5',
        dark: '#1A202C',
        'card-light': '#FFFFFF',
        'card-dark': '#2D3748',
        'text-main': '#1A202C',
        'text-main-dark': '#F7FAFC',
        'text-muted': '#718096',
        'text-muted-dark': '#E2E8F0',
        'border-light': '#E2E8F0',
        'border-dark': '#4A5568',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
