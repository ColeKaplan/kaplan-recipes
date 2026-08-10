/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "hero-background": "url('./img/family.avif')",
        "side-bar-background": "url('./img/SideBarBackground.jpg')",
      },
    },
  },
  plugins: [],
};
