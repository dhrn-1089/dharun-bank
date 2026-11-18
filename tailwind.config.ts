import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#051A40",
          800: "#082B67", // Primary Navy Blue
          700: "#0C367C",
          600: "#123F85", // Secondary Blue
          500: "#1B4F9E",
          100: "#E6EDF8",
          50: "#F0F4FA",
        },
        gold: {
          700: "#B88200",
          600: "#CC9100",
          500: "#E6A500", // Gold
          400: "#F2B924",
          300: "#F7CE61",
          100: "#FDF4DB",
          50: "#FDF9EE",
        },
        background: "#F5F7FB",
        surface: "#FFFFFF",
        brandDark: "#17243A",
      },
    },
  },
  plugins: [],
};
export default config;
