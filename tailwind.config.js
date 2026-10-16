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
        offwhite: '#FBF8F3',
        // Warm Rich Browns / Cognac / Caramel (replaces old blue/indigo)
        indigo: {
          50: '#FDFBF7',   // warm cream tint
          100: '#F6EFE3',  // softest warm beige
          200: '#EBDCC8',  // light almond
          300: '#DEC4A6',  // warm sand / biscuit
          400: '#C7A37C',  // warm golden tan
          500: '#AD8253',  // rich caramel
          600: '#8E5E2F',  // primary rich warm brown / cognac
          700: '#73481F',  // deep warm mocha
          800: '#583413',  // dark espresso
          900: '#3D220A',  // dark chocolate roast
          950: '#231204',  // deep roast bean
        },
        // Warm Beige & Neutral Sand (replaces old cold bluish Slate)
        slate: {
          50: '#FBF9F5',   // clean luminous light warm beige background
          100: '#F5EFE4',  // soft light beige surface / card background
          200: '#E8DED1',  // warm beige border / divider
          300: '#D5C4B1',  // tan border / neutral line
          400: '#A4907C',  // muted warm taupe text
          500: '#7F6B56',  // medium warm taupe
          600: '#5F4D3B',  // primary body text (dark warm taupe)
          700: '#473727',  // dark warm espresso headings
          800: '#2F2317',  // dark mode warm surface
          900: '#22180E',  // dark mode card
          950: '#160E08',  // dark mode deep espresso
        },
        // Warm Terracotta / Amber Bronze (replaces cold Violet)
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
          50: '#FDFBF7',
          100: '#F6EFE3',
          200: '#EBDCC8',
          300: '#DEC4A6',
          400: '#C7A37C',
          500: '#AD8253',
          600: '#8E5E2F',
          700: '#73481F',
          800: '#583413',
          900: '#3D220A',
          950: '#231204',
        }
      }
    },
  },
  plugins: [],
}
