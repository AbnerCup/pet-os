import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f6f7f4",
          100: "#e8f0e3",
          200: "#d1e0c7",
          500: "#7c9a6b",
          600: "#5c7a4b",
          700: "#4a633c", // <--- ESTE ES EL QUE FALTA PARA EL HOVER
          900: "#2a3b2d",
        },
      },
    },
  },
  plugins: [],
};
export default config;