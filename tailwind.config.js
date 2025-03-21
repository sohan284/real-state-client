/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0px 43.75px 54.167px -22.917px rgba(7, 1, 39, 0.07)',
      },
    },
  },
  plugins: [],
}