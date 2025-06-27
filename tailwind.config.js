// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Dodajemy na przyszłość
  ],
  theme: {
    extend: {
      colors: {
        'phoenix-bg': 'hsl(var(--phoenix-bg))',
        'phoenix-container-bg': 'hsl(var(--phoenix-container-bg))',
        'phoenix-text-primary': 'hsl(var(--phoenix-text-primary))',
        'phoenix-text-secondary': 'hsl(var(--phoenix-text-secondary))',
        'phoenix-accent': 'hsl(var(--phoenix-accent))',
        'phoenix-highlight': 'hsl(var(--phoenix-highlight))',
        'phoenix-border': 'hsl(var(--phoenix-border))',
      },
      borderColor: theme => ({
        ...theme('colors'),
        DEFAULT: 'hsl(var(--phoenix-border))',
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
};