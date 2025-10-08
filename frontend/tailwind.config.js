/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)", // primary color loaded from App.css
        secondary: "var(--secondary)",
        third: "var(--third)",
        background: "var(--background)",
        hoverr: "var(--hoverr",
      },
    },
    fontFamily:{
      work: ['Work Sans', 'sans-serif'],
      playfair: ['Playfair Display', 'serif'],
      poppins: ['Poppins', 'serif'],
    }
  },
  plugins: [],
}
