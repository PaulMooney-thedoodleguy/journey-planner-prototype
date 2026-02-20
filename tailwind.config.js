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
        mode: {
          train:      '#003078',
          bus:        '#b45309',
          tram:       '#6d28d9',
          ferry:      '#0e7490',
          tube:       '#dc2626',
          walk:       '#15803d',
          cycle:      '#c2410c',
          multimodal: '#374151',
        },
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  safelist: [
    'bg-mode-train', 'bg-mode-bus', 'bg-mode-tram', 'bg-mode-ferry',
    'bg-mode-tube', 'bg-mode-walk', 'bg-mode-cycle', 'bg-mode-multimodal',
  ],
  plugins: [],
}
