/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'card-bg': 'var(--card-bg)',
        'border-color': 'var(--border-color)',
        'bg-color': 'var(--bg-color)',
        'text-color': 'var(--text-color)',
      },
    },
  },
  plugins: [],
} 