// ─── App identity ────────────────────────────────────────────────────────────
export const BRAND_META = {
  appName: 'Journey Planner',
  tagline:  'Plan your UK journey',
} as const;

// ─── Logo ─────────────────────────────────────────────────────────────────────
// type: 'svg'   → renders src/assets/icons/brand/logo.svg as a React component
// type: 'image' → renders an <img> using src + width/height
// type: 'text'  → renders the original Train icon + appName text (safe fallback)
export const BRAND_LOGO = {
  type:   'text' as 'svg' | 'image' | 'text',
  src:    '',
  alt:    'Journey Planner',
  width:  140,
  height: 32,
} as const;

// ─── Transport mode config ────────────────────────────────────────────────────
// bgClass   → Tailwind background applied to solid-fill mode icon containers
// textClass → Tailwind text colour applied to solid-fill mode icon containers
// hex       → raw hex value (must match tailwind.config.js theme.extend.colors.mode)
//             used for inline-style icon containers (light bg tint + coloured border)
// label     → human-readable mode name
export const MODE_CONFIG = {
  train:      { bgClass: 'bg-mode-train',      textClass: 'text-white', hex: '#003078', label: 'Train'        },
  bus:        { bgClass: 'bg-mode-bus',        textClass: 'text-white', hex: '#b45309', label: 'Bus'          },
  tram:       { bgClass: 'bg-mode-tram',       textClass: 'text-white', hex: '#6d28d9', label: 'Tram'         },
  ferry:      { bgClass: 'bg-mode-ferry',      textClass: 'text-white', hex: '#0e7490', label: 'Ferry'        },
  tube:       { bgClass: 'bg-mode-tube',       textClass: 'text-white', hex: '#dc2626', label: 'Underground'  },
  walk:       { bgClass: 'bg-mode-walk',       textClass: 'text-white', hex: '#15803d', label: 'Walk'         },
  cycle:      { bgClass: 'bg-mode-cycle',      textClass: 'text-white', hex: '#c2410c', label: 'Cycle'        },
  multimodal: { bgClass: 'bg-mode-multimodal', textClass: 'text-white', hex: '#374151', label: 'Multi-mode'   },
} as const;
