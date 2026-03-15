/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2ff',
          100: '#e4edf8',
          200: '#c3d4ed',
          300: '#91b2dc',
          400: '#5988c6',
          500: '#1a3d6e',
          600: '#112b50',
          700: '#0f2847',
          800: '#0b1f3a',
          900: '#070f1c',
        },
        orange: {
          50:  '#fff3ec',
          100: '#ffd0b3',
          400: '#ff8c45',
          500: '#e8580a',
          600: '#d04a00',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        'sm-navy': '0 2px 8px rgba(11,31,58,.08)',
        'md-navy': '0 6px 20px rgba(11,31,58,.12)',
        'lg-navy': '0 12px 40px rgba(11,31,58,.16)',
        'orange':  '0 4px 16px rgba(232,88,10,.32)',
      },
    },
  },
  plugins: [],
};
