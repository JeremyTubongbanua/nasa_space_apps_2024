/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        choco: "#4A051c",
        vistablue: "#7EA3cc",
        copper: "#a8763e",
        indigodye: "#0c4767",
        lightblue: "#90c2e7",
      },
    },
  },
  plugins: [],
};
