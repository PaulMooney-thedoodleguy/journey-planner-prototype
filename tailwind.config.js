/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Naviquate brand tokens ────────────────────────────────────────────
        // brand.DEFAULT / hover are used throughout for header, buttons, avatars.
        // White text on brand.DEFAULT (#4E5866) = 6.96:1 contrast ✓ WCAG AA
        brand: {
          DEFAULT: '#4E5866',    // Naviquate Grey — header, buttons, fills
          hover:   '#3d4752',    // darker grey — hover / active tab backgrounds
          tint:    '#4E5866',    // same grey — input focus rings
          light:   '#edf8f2',    // light teal tint — card highlights
        },
        // ── Naviquate extended palette ────────────────────────────────────────
        niq: {
          teal:      '#54BF8A',    // Naviquate Teal — primary accent / IQ mark
          'teal-dark': '#3da876',  // darker teal — button hover state
          orange:  '#F36800',    // Naviquate Orange
          blue:    '#638DA6',    // Naviquate Blue
          sky:     '#A7DDE1',    // Naviquate Sky Blue
          ice:     '#F6F6F6',    // Naviquate Ice — page background
          grey:    '#4E5866',    // Naviquate Grey (alias)
        },
        // ── Surface & content (unchanged) ────────────────────────────────────
        surface: {
          DEFAULT: '#F6F6F6',    // Naviquate Ice
          card:    '#ffffff',
          muted:   '#eff2f4',
        },
        content: {
          primary:   '#222428',
          secondary: '#636469',
          disabled:  '#9e9e9e',
        },
        // ── Transport mode colours (unchanged) ───────────────────────────────
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
        // Sofia Pro is the brand typeface (loaded via Adobe Fonts if available).
        // Nunito is the closest open-source alternative (rounded geometric sans).
        // Arial is the approved system fallback per the Naviquate brand guide.
        sans: ['"Sofia Pro"', '"Nunito"', 'Arial', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  safelist: [
    'bg-mode-train', 'bg-mode-bus', 'bg-mode-tram', 'bg-mode-ferry',
    'bg-mode-tube', 'bg-mode-walk', 'bg-mode-cycle', 'bg-mode-multimodal',
  ],
  plugins: [],
}
