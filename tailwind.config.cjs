/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  plugins: [
    require("@kobalte/tailwindcss"),
    ({ addVariant }) => {
      addVariant("popover-open", "&:popover-open");
    },
  ],
  theme: {
    fontFamily: {
      shortstack: ["shortstack"],
      ubuntu: ["ubuntu"], // For use in Satori og image generator
    },
    extend: {
      animation: {
        "gradient-bg": "spin linear 5s infinite",
      },
      backgroundImage: {
        "layered-waves-light": "url('/graphics/layered-waves-light.svg')",
        "layered-waves-dark": "url('/graphics/layered-waves-dark.svg')",
      },
      colors: {},
    },
  },
};
