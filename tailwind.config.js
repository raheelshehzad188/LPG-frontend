/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        deep: '#0f172a',
        primary: {
          DEFAULT: '#059669',
          50: '#ecfdf5',
          500: '#059669',
          600: '#047857',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(5, 150, 105, 0.5)',
        'glow-lg': '0 0 30px rgba(5, 150, 105, 0.4)',
      },
    },
  },
  plugins: [],
}
