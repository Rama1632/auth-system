/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        steel: "#475569",
        skyline: "#0f766e",
        glow: "#ecfeff"
      },
      boxShadow: {
        panel: "0 20px 45px -25px rgba(15, 23, 42, 0.28)"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
