export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tray-tan': '#D4A574',
        'tile-beige': '#E8DCC4',
        'mystery-meat': '#8B4513',
        'mustard-yellow': '#FFD700',
        'ketchup-red': '#E63946',
        'pickle-green': '#2A9D8F',
        'milk-carton': '#F4F1DE',
        'chocolate-milk': '#6F4E37',
        'chalkboard': '#2F4538',
        'linoleum': '#E0E0E0',
        'metal-gray': '#A8A9AD',
        'neon-orange': '#FF6B35',
        'bubblegum-pink': '#FF69B4',
        'grape-juice': '#7209B7',
      },
      fontFamily: {
        'display': ['Fredoka One', 'cursive'],
        'body': ['Baloo 2', 'sans-serif'],
      },
      borderRadius: {
        'cafeteria': '16px',
      },
      boxShadow: {
        'tray': '0 6px 0 0 rgba(0,0,0,0.2), 0 8px 12px rgba(0,0,0,0.15)',
        'card': '0 4px 0 0 rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.1)',
        'sticker': '0 2px 8px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}