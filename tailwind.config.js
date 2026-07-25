/** @type {import('tailwindcss').Config} */
export default {
  // Abilita la modalità scura tramite classe .dark sul tag radice
  darkMode: 'class',
  
  // Mappa tutti i file JS/JSX/TS/TSX dentro src per estrarre le classi Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // Palette colori per l'effetto Glassmorphism
      colors: {
        glass: {
          dark: 'rgba(15, 23, 42, 0.65)',
          light: 'rgba(255, 255, 255, 0.65)',
          borderDark: 'rgba(255, 255, 255, 0.1)',
          borderLight: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
  },
  plugins: [],
}