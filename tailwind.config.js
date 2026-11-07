/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        ink: '#0F172A',
        muted: '#64748B',
        line: '#E2E8F0',
        brand: {
          DEFAULT: '#0F766E',
          dark: '#115E59',
          soft: '#CCFBF1',
        },
        accent: '#F59E0B',
        danger: {
          DEFAULT: '#B91C1C',
          soft: '#FEE2E2',
        },
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
