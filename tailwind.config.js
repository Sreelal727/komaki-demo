/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#dae6ff', 200: '#bccfff', 300: '#8eabff',
          400: '#597dff', 500: '#3355f5', 600: '#1f39db', 700: '#1a2db0',
          800: '#1b298c', 900: '#1c2872', 950: '#141a45',
        },
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b0b8c9',
          400: '#8590a8', 500: '#66718c', 600: '#515a73', 700: '#43495d',
          800: '#3a3f4f', 900: '#171a24', 950: '#0d0f16',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
