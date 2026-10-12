/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // The page background (index.html)
        ink: '#08161c',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { opacity: '0', transform: 'scale(0.985)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Aurora blobs: three slow, out-of-step paths so the colour never visibly loops
        'drift-a': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '33%': { transform: 'translate3d(7vmax, 5vmax, 0) scale(1.1)' },
          '66%': { transform: 'translate3d(-3vmax, 8vmax, 0) scale(0.95)' },
        },
        'drift-b': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(-10vmax, 7vmax, 0) scale(1.15)' },
        },
        'drift-c': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1.05)' },
          '50%': { transform: 'translate3d(8vmax, -7vmax, 0) scale(0.9)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms ease-out both',
        'zoom-in': 'zoom-in 200ms ease-out both',
        'drift-a': 'drift-a 28s ease-in-out infinite',
        'drift-b': 'drift-b 34s ease-in-out infinite',
        'drift-c': 'drift-c 41s ease-in-out infinite',
        sweep: 'sweep 1.4s ease-in-out infinite',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
