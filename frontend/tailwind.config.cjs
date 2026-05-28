/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#DC2626',
          maroon: '#8B1A1A',
          darkBrown: '#5C2E1F',
          yellow: '#FCD34D',
          lightYellow: '#FEF3C7',
        },
      },
      fontFamily: {
        // Changed 'Riuka' to 'Ruika' to match your font name
        sans: ['Ruika', '"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}