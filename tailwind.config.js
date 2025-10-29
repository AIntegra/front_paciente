/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E88E5", // azul principal
        secondary: "#E3F2FD", // fondo claro azul
        accent: "#42A5F5", // botones o detalles
        success: "#4CAF50",
        warning: "#FB8C00",
        danger: "#E53935",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 12px rgba(30, 136, 229, 0.1)",
      },
    },
  },
  plugins: [],
}
