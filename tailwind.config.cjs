/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  plugins: [
    require("@kobalte/tailwindcss"),
  ],
  theme: {
    fontFamily: {
      "shortstack": ["shortstack"],
    },
    extend: {
      animation: {
        "gradient-bg": "spin linear 5s infinite",
      },
      backgroundImage: {
        'layered-waves-light': "url('/graphics/layered-waves-light.svg')",
        'layered-waves-dark': "url('/graphics/layered-waves-dark.svg')",
      },
      colors: {
        "neon-gray": {
          50: "#f7f8f8",
          100: "#dee3e2",
          200: "#bcc8c7",
          300: "#93a5a4",
          400: "#6c7f7e",
          500: "#506262",
          600: "#3b494a",
          700: "#2c3435",
          800: "#212527",
          900: "#181b1b",
        },

        "neon-turquoise": {
          50: "#e7fff9",
          100: "#c6fff0",
          200: "#92ffe6",
          300: "#4dffdf",
          400: "#00ffd1",
          500: "#00e8bc",
          600: "#00be9b",
          700: "#009881",
          800: "#007867",
          900: "#006256",
        },
        "neon-blue": {
          50: "#eefdfd",
          100: "#d5f7f8",
          200: "#afeef2",
          300: "#78e0e8",
          400: "#31c6d4",
          500: "#1eacbc",
          600: "#1c8b9e",
          700: "#1d7081",
          800: "#205b6a",
          900: "#1f4d5a",
        },
        "neon-red": {
          50: "#fff1f1",
          100: "#ffdfdf",
          200: "#ffc5c5",
          300: "#ff9d9d",
          400: "#ff6464",
          500: "#ff1e1e",
          600: "#ed1515",
          700: "#c80d0d",
          800: "#a50f0f",
          900: "#881414",
        },
        "neon-yellow": {
          50: "#fbfee8",
          100: "#f6ffc2",
          200: "#f2ff88",
          300: "#f2ff45",
          400: "#f7fd04",
          500: "#ede905",
          600: "#cdb901",
          700: "#a38605",
          800: "#87690c",
          900: "#725511",
        },
      },
    },
  },
};
