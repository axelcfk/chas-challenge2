/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "deep-purple": "#110A19", // custom purple color
        "lighter-purple": "#241838", // lighter shade of custom purple
        midnight: "#020617", // custom color representing midnight
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))", // custom radial gradient
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))", // custom conic gradient
      },
      keyframes: {
        "slide-up-fade": {
          "0%": {
            transform: "translateY(100%)", // Start from below the initial position
            opacity: 0,
          },
          "100%": {
            transform: "translateY(0)", // End at the initial position
            opacity: 1,
          },
        },
        "fade-out": {
          from: {
            opacity: 1,
          },
          to: {
            opacity: 0,
          },
        },
      },
      animation: {
        "slide-up-fade-in": "slide-up-fade 0.5s ease-out forwards",
        "fade-out": "fade-out 0.5s ease-out forwards",
      },

      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        bebas: ["Bebas Neue", "sans-serif"],
      },
    },
  },
  plugins: [],
};
