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
        offwhite: '#FAF7F2', // Option 1: Oat Milk background
        // Option 1: Soft Latte Brown Accents & Buttons
        indigo: {
          50: '#FAF4EC',   // light latte tint
          100: '#F4ECE0',  // latte badge & pill background
          200: '#E8D8C3',  // latte subtle border
          300: '#D5BDA2',  // soft biscuit
          400: '#C49F7D',  // warm golden tan
          500: '#BD926D',  // latte warm mid
          600: '#B38A65',  // PRIMARY: Soft Latte Brown (Accent & Buttons)
          700: '#9C734E',  // latte button hover
          800: '#845E3B',  // deep latte button active
          900: '#6B4A2D',  // warm mocha roast
          950: '#4A321D',  // deep espresso roast
        },
        // Option 1: Oat Milk Surfaces, Soft Warm Cream Borders & Muted Warm Taupe / Espresso Text
        slate: {
          50: '#FAF7F2',   // Oat Milk page background
          100: '#F5EFE6',  // soft cream card/table-header background
          200: '#EDE6DC',  // soft cream border / divider
          300: '#DCD2C4',  // neutral border
          400: '#A8988E',  // subtle placeholder & icons
          500: '#8C7A70',  // MUTED: Warm taupe text
          600: '#6F5F58',  // secondary body text
          700: '#5A4C48',  // medium heading text
          800: '#4A3E3D',  // PRIMARY: Soft warm dark espresso text
          900: '#382E2E',  // deep espresso headings & dark cards
          950: '#251E1E',  // dark mode background
        },
        // Warm Terracotta / Amber Bronze harmony
        violet: {
          50: '#FAF5F0',
          100: '#F5EBE1',
          200: '#EBD6C3',
          300: '#DEBA9F',
          400: '#CA9875',
          500: '#B87B53',
          600: '#A3663E',
          700: '#8A512D',
          800: '#6F3F21',
          900: '#542E16',
          950: '#33190A',
        },
        brand: {
          50: '#FAF4EC',
          100: '#F4ECE0',
          200: '#E8D8C3',
          300: '#D5BDA2',
          400: '#C49F7D',
          500: '#BD926D',
          600: '#B38A65',
          700: '#9C734E',
          800: '#845E3B',
          900: '#6B4A2D',
          950: '#4A321D',
        }
      }
    },
  },
  plugins: [],
}
