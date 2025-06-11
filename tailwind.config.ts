/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",  // ✅ Ajoute ton fichier HTML principal
    "./src/**/*.{js,ts,jsx,tsx}",  // ✅ Ajoute tous les fichiers JS/TS dans src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
