import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F6F0E4",
        hops: "#2F4A2B",
        forest: "#14211A",
        bavarian: "#0098D4",
        gold: "#E0A526",
        pretzel: "#7A4A25",
        berry: "#8E2B3F",
        chalk: "#FFFFFF",
      },
      borderRadius: { editorial: "14px" },
      fontFamily: { display: ["var(--font-fraunces)"], sans: ["var(--font-inter)"] },
    },
  },
  plugins: [],
};

export default config;
