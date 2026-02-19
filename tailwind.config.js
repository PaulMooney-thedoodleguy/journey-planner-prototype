/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0054e9',
          hover:   '#004acd',
          tint:    '#1a65eb',
          light:   '#e8f0fd',
        },
        surface: {
          DEFAULT: '#f4f5f8',
          card:    '#ffffff',
          muted:   '#eff2f4',
        },
        content: {
          primary:   '#222428',
          secondary: '#636469',
          disabled:  '#9e9e9e',
        },
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
