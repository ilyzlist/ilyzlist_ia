// tailwind.config.js
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Updated text colors to enforce stronger black
        black: '#000000', // Added explicit black definition
        primary: {
          DEFAULT: "#3742D1",
          50: "#E8EAFB",
          100: "#D5D9F8",
          200: "#AEB7F1",
          300: "#8895EA",
          400: "#5F72E3",
          500: "#3742D1",
          600: "#2C36AD",
          700: "#212989",
          800: "#161D65",
          900: "#0B1041",
        },
        secondary: {
          DEFAULT: "#E2EAFF",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFFFFF",
          300: "#FFFFFF",
          400: "#F2F6FF",
          500: "#E2EAFF",
          600: "#AAC6FF",
          700: "#72A2FF",
          800: "#3A7EFF",
          900: "#025AFF",
        },
        accent: {
          DEFAULT: "#809CFF",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#F5F7FF",
          300: "#D1DBFF",
          400: "#ACBEFF",
          500: "#809CFF",
          600: "#4C71FF",
          700: "#1846FF",
          800: "#0030E0",
          900: "#0024AC",
        },
        background: "#F3F4F6",
        text: {
          primary: "#000000", // Changed from #070707 to pure black
          secondary: "#3742D1",
          muted: "#809CFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        "league-spartan": ["League Spartan", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 4px 12px rgba(55, 66, 209, 0.1)",
        button: "0 4px 6px -1px rgba(55, 66, 209, 0.3)",
      },
      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    // Added plugin to enforce black text globally while preserving heading colors
    function({ addBase }) {
      addBase({
        'body': { color: '#000000' },
        'h1, h2, h3, h4, h5, h6': { color: 'inherit' },
      });
    }
  ],
};