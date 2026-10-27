/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17251f',
        forest: '#214d3b',
        moss: '#6c8164',
        sand: '#f5f3ed',
        clay: '#c87952'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'ui-serif', 'serif']
      },
      boxShadow: { soft: '0 18px 55px rgba(26, 44, 34, 0.09)' }
    }
  },
  plugins: []
};
