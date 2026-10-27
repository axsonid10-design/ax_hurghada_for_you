/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          navy: '#0a2540',
          deep: '#061829',
          ocean: '#0284c7',
          sky: '#38bdf8',
          cyan: '#06b6d4',
          gold: '#f59e0b',
          amber: '#d97706',
          coral: '#f43f5e',
          surface: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
        },
        primary: {
          DEFAULT: '#0a2540',
          dark: '#061829',
          light: '#1e3a5f',
          container: '#e0f2fe',
        },
        secondary: {
          DEFAULT: '#0284c7',
          light: '#38bdf8',
          dark: '#0369a1',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        }
      },
      borderRadius: {
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(10, 37, 64, 0.06), 0 1px 3px -1px rgba(10, 37, 64, 0.04)',
        card: '0 4px 20px -2px rgba(10, 37, 64, 0.08)',
        float: '0 12px 30px -4px rgba(10, 37, 64, 0.16)',
      }
    },
  },
  plugins: [],
}
