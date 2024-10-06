/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      serif: [
        "ui-serif",
        "Georgia",
        "Cambria",
        "Times New Roman",
        "Times",
        "serif",
      ],
    },
    extend: {
      backgroundImage: {
        mainbg: "url('/public/Background.png')",
        aboutbg: "url('/public/Lines.svg')",
        mapbg: "url('/public/MAP_Page.png')",
      },
      backgroundSize: {
        "75%": "75%",
        "50%": "50%",
      },
      colors: {
        choco: "#4A051c",
        vistablue: "#7EA3cc",
        copper: "#a8763e",
        indigodye: "#0c4767",
        lightblue: "#90c2e7",
        cream: "#f7f2ec",
      },
    },
  },
  plugins: [],
};
