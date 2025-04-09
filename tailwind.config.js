module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: "#1e3a8a",
        lightGray: "#f3f4f6",
        darkGray: "#4b5563",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
