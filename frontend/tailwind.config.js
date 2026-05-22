export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        bgPrimary: "#0f0f0f",
        bgSecondary: "#151515",
        bgCard: "#1e1e1e",
        textPrimary: "#e5e5e5",
        textSecondary: "#9ca3af",
        accent: "#e58d27",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,.35)",
      },
    },
  },
  plugins: [],
};
