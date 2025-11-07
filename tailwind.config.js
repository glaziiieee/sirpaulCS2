/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD5E0',
          dark: '#FFC5CF',
        },
        secondary: '#FFACB5',
        accent: {
          DEFAULT: '#C1C1ED',
          dark: '#B5B5E5',
        },
        text: {
          dark: '#555555',
          light: '#FFFFFF',
        },
        bg: {
          light: '#FFFFFF',
          dark: '#F8F8F8',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}