/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
  extend: {
    colors: {
      primary: "#0F5C4D", 
      unvm: {
        red: "#E30613",
        blue: "#0A2E57",
        light: "#F5F7FA",
        gray: "#6B7280",
      },
    },
  },
},
  plugins: [],
};
