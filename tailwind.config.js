/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wonder: {
          purple: '#7C3AED',
          'purple-dark': '#5B21B6',
          'purple-light': '#A78BFA',
          yellow: '#FBBF24',
          'yellow-light': '#FDE68A',
          orange: '#F97316',
          'orange-light': '#FDBA74',
          white: '#FFFFFF',
          cream: '#FFF7ED',
        }
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['"Nunito"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
