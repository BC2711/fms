/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { accent: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' } },
    keyframes: { 'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } }, 'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } } },
    animation: { 'fade-in': 'fade-in 180ms ease-out', 'slide-up': 'slide-up 220ms ease-out' },
  } },
  plugins: [],
}
