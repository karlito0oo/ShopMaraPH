/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lovelo': ['Lovelo', 'sans-serif'], // Header font
        'source-code': ['Source Code Pro', 'monospace'], // Body font
        'header': ['Lovelo', 'sans-serif'], // Alias for headers
        'body': ['Source Code Pro', 'monospace'], // Alias for body text
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