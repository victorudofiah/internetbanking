// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7f8ff",
          100: "#eef1ff",
          200: "#d8dbff",
          300: "#b6bfff",
          400: "#867bff",
          500: "#5f42ff", // primary (purple)
          600: "#3f2ef7",
          700: "#2a1bd4",
          800: "#1f148f",
          900: "#120a4d",
        },
        accent: {
          500: "#00d4ff", // cyan accent
        },
        glass: "rgba(255,255,255,0.06)",
      },
      boxShadow: {
        'glass-lg': '0 8px 30px rgba(6, 7, 14, 0.5)',
      },
      borderRadius: {
        'xl2': '1.25rem'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
