/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bgLight: '#F5F2EB',
        bgDark: '#0E0D0B',
        secBgLight: '#ECE7DE',
        secBgDark: '#171614',
        cardLight: '#FFFFFF',
        cardDark: '#1F1E1B',
        textLight: '#171717',
        textDark: '#ECE7DE',
        subLight: '#5E5E5E',
        subDark: '#A5A095',
        accent: '#C56E33',
        accentHover: '#A84D1C',
        secAccent: '#325C5A',
        secAccentHover: '#234442',
        borderLight: 'rgba(0,0,0,0.08)',
        borderDark: 'rgba(255,255,255,0.08)'
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-medium': 'floatMedium 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'grain': 'noise 8s steps(10) infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(1deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '1' },
        },
        noise: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0)' },
          '70%': { transform: 'translate(0, 15%)' },
          '85%': { transform: 'translate(3%, 35%)' },
          '95%': { transform: 'translate(-10%, 10%)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
