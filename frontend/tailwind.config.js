/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#4F46E5', // muted indigo
          hover: '#4338CA',
        },
        light: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          text: '#111827',
          muted: '#6B7280',
        },
        dark: {
          bg: '#0F1115',
          surface: '#181A20',
          border: '#2B2F36',
          text: '#F3F4F6',
          muted: '#9CA3AF',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'md': '8px',
      }
    },
  },
  plugins: [],
}
