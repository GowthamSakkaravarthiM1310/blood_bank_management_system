/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e11d48", // Rose 600
        secondary: "#be123c", // Rose 700
      }
    },
  },
  plugins: [],
}
