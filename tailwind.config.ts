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
        thofnaa: {
          navy: {
            DEFAULT: "#12355B",
            50: "#f2f6fa",
            100: "#e2ecf4",
            600: "#184577",
            700: "#12355B",
            800: "#0e2947",
            900: "#0a1d33",
          },
          emerald: {
            DEFAULT: "#159A6A",
            50: "#f0fdf7",
            100: "#dcfce7",
            600: "#159A6A",
            700: "#107c55",
            800: "#0c5f41",
          },
          gold: {
            DEFAULT: "#E7B33E",
            50: "#fffdf5",
            100: "#fff8d6",
            500: "#E7B33E",
            600: "#d29c27",
            700: "#b07f1a",
          },
          ivory: {
            DEFAULT: "#F8F7F2",
            dark: "#efedd8",
          },
          charcoal: {
            DEFAULT: "#263238",
            light: "#37474f",
            muted: "#546e7a",
          },
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        academic: "0 10px 30px -10px rgba(18, 53, 91, 0.12)",
        card: "0 4px 20px -2px rgba(18, 53, 91, 0.08)",
        gold: "0 4px 14px 0 rgba(231, 179, 62, 0.39)",
      },
    },
  },
  plugins: [],
};
export default config;
