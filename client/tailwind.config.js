/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wa-bg': '#0c1317',
        'wa-sidebar': '#202c33',
        'wa-panel': '#111b21',
        'wa-accent': '#00a884',
        'wa-bubble-sent': '#005c4b',
        'wa-bubble-received': '#202c33',
        'wa-text-primary': '#e9edef',
        'wa-text-secondary': '#8696a0',
      }
    },
  },
  plugins: [],
}
