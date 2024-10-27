/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'permanent-marker': ['"Permanent Marker"', 'cursive'],
        'montserrat': ['"Montserrat"', 'sans-serif'],
      },
      colors: {
        urbanBrown: '#8B4513', 
        navyBlue: '#001F3F'
      },
    },
  },
  plugins: [],
}