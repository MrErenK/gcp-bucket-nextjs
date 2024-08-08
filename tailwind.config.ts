import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6', // Blue-500
          dark: '#60A5FA', // Blue-400
        },
        secondary: {
          light: '#6B7280', // Gray-500
          dark: '#9CA3AF', // Gray-400
        },
        background: {
          light: '#F3F4F6', // Gray-100
          dark: '#1F2937', // Gray-800
        },
        surface: {
          light: '#FFFFFF',
          dark: '#374151', // Gray-700
        },
      },
    },
  },
  plugins: [],
};
export default config;
