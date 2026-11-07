import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
      colors: {
        tinta: {
          50: '#eef4ff', 100: '#dae6ff', 200: '#bdd3ff', 300: '#90b6fe', 400: '#5c8ffb',
          500: '#3768f6', 600: '#2149eb', 700: '#1a37d0', 800: '#1c2fa8', 900: '#1d2e84', 950: '#161d51',
        },
        papel: '#fbfaf7',
      },
      boxShadow: {
        suave: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)',
      },
      keyframes: {
        surgir: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        subir: { from: { opacity: 0, transform: 'translateY(32px)' }, to: { opacity: 1, transform: 'none' } },
        aparecer: { from: { opacity: 0 }, to: { opacity: 1 } },
        pulsar: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.06)' } },
      },
      animation: { surgir: 'surgir .35s ease-out backwards', subir: 'subir .3s cubic-bezier(.2,.8,.2,1) backwards', pulsar: 'pulsar 2s ease-in-out infinite', aparecer: 'aparecer .25s ease-out' },
    },
  },
  plugins: [typography],
}
