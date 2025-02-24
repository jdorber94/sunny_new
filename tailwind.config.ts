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
        background: "var(--background)",
        foreground: "var(--foreground)", 
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'sparkle': 'sparkle 1s ease-in-out',
        'progress-celebration': 'progress-celebration 1s ease-in-out',
        'scale-bounce': 'scale-bounce 0.5s ease-in-out',
      },
    },
  },
  safelist: [
    'text-green-400',
    'text-blue-400',
    'text-red-400',
    'from-blue-50',
    'via-white',
    'to-indigo-50',
    'bg-white/60',
    'hover:bg-white/70',
  ],
};

export default config;
