/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'permanent-marker': ['"Permanent Marker"', 'cursive'],
        'montserrat': ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        urbanBrown: '#8B4513', 
      },
    },
  },
  plugins: [],
}