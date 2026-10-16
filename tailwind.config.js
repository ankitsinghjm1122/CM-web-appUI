/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        offwhite: '#F6EFE3', // softest warm beige
        // Warm Rich Browns / Cognac / Caramel
        indigo: {
          50: '#FAF6ED',   // warm cream tint
          100: '#F6EFE3',  // softest warm beige
          200: '#EBDCC8',  // light almond
          300: '#DEC4A6',  // warm sand / biscuit
          400: '#C29C74',  // warm golden tan
          500: '#A67C52',  // rich caramel
          600: '#845A32',  // primary rich warm brown / cognac
          700: '#6B4522',  // deep warm mocha
          800: '#523317',  // dark espresso
          900: '#3A220D',  // dark roast
          950: '#221206',  // deep bean
        },
        // Softest Warm Beige & Muted Warm Taupe Text
        slate: {
          50: '#FAF6ED',   // clean light warm cream
          100: '#F6EFE3',  // softest warm beige surface & cards
          200: '#EBDCC8',  // softest warm beige border / divider
          300: '#DEC4A6',  // tan border / neutral line
          400: '#A4907C',  // muted warm taupe text
          500: '#8B7864',  // soft warm taupe text
          600: '#705F4D',  // muted warm taupe body text
          700: '#5C4D3E',  // deep muted warm taupe headings
          800: '#2A2016',  // dark mode warm surface
          900: '#1E160E',  // dark mode card
          950: '#140E08',  // dark mode deep espresso
        },
        // Warm Terracotta / Amber Bronze
        violet: {
          50: '#FDF7F2',
          100: '#F9ECE2',
          200: '#F2D5C2',
          300: '#E7B799',
          400: '#D6926B',
          500: '#BF7245',
          600: '#A5572E',
          700: '#86411F',
          800: '#6A3116',
          900: '#4D220E',
          950: '#280F05',
        },
        brand: {
          50: '#FAF6ED',
          100: '#F6EFE3',
          200: '#EBDCC8',
          300: '#DEC4A6',
          400: '#C29C74',
          500: '#A67C52',
          600: '#845A32',
          700: '#6B4522',
          800: '#523317',
          900: '#3A220D',
          950: '#221206',
        }
      }
    },
  },
  plugins: [],
}
