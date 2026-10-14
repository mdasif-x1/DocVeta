/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7dafe',
          300: '#9ebffd',
          400: '#6094fa',
          500: '#2563eb',
          600: '#1d4ed8', // Restrained deep sapphire
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0b132b',
        },
        ink: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b0f19', // Matte obsidian for document darkrooms
        },
        warm: {
          50: '#fafaf9',  // Warm ivory background
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

