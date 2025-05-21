/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'como': ['"Como Light"', 'sans-serif'], // Como Light font
      },
      colors: {
        'brand-pink': '#ad688f',
      },
      // Add utility classes for scrollbar customization
      utilities: {
        '.hide-scrollbar': {
          /* Hide scrollbar for Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          /* Hide scrollbar for IE, Edge and Firefox */
          '-ms-overflow-style': 'none',  /* IE and Edge */
          'scrollbar-width': 'none'  /* Firefox */
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities }) {
      const newUtilities = {
        '.hide-scrollbar': {
          /* Hide scrollbar for Chrome, Safari and Opera */
          '::-webkit-scrollbar': {
            display: 'none'
          },
          /* Hide scrollbar for IE, Edge and Firefox */
          '-ms-overflow-style': 'none',  /* IE and Edge */
          'scrollbar-width': 'none'  /* Firefox */
        }
      };
      
      addUtilities(newUtilities);
    }
  ],
} 