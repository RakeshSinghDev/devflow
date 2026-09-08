/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F6F7F9',
          dark: '#0F1115',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#15181E',
          secondaryLight: '#F9FAFB',
          elevatedDark: '#1B1F27',
        },
        brand: {
          blue: '#2563EB',
          blueDark: '#1D4ED8',
          blueLightMode: '#2563EB',
          blueDarkMode: '#3B82F6',
          green: '#16A34A',
          orange: '#D97706',
          red: '#DC2626',
          purple: '#7C3AED',
        },
        border: {
          light: '#E5E7EB',
          dark: '#2A303A',
        },
        text: {
          primaryLight: '#111827',
          secondaryLight: '#667085',
          mutedLight: '#98A2B3',
          primaryDark: '#F5F7FA',
          secondaryDark: '#A7AFBD',
          mutedDark: '#667085',
        }
      },
      borderRadius: {
        'control': '0.625rem', // 10px - inputs / buttons
        'control-md': '0.75rem', // 12px - buttons
        'card': '1rem',        // 16px - standard card
        'feature': '1.25rem',   // 20px - feature card
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 8px 30px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
