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
// bgClass   → Tailwind background applied to mode icon containers
// textClass → Tailwind text colour applied to mode icon containers
// label     → human-readable mode name
export const MODE_CONFIG = {
  train:      { bgClass: 'bg-mode-train',      textClass: 'text-white', label: 'Train'        },
  bus:        { bgClass: 'bg-mode-bus',        textClass: 'text-white', label: 'Bus'          },
  tram:       { bgClass: 'bg-mode-tram',       textClass: 'text-white', label: 'Tram'         },
  ferry:      { bgClass: 'bg-mode-ferry',      textClass: 'text-white', label: 'Ferry'        },
  tube:       { bgClass: 'bg-mode-tube',       textClass: 'text-white', label: 'Underground'  },
  walk:       { bgClass: 'bg-mode-walk',       textClass: 'text-white', label: 'Walk'         },
  cycle:      { bgClass: 'bg-mode-cycle',      textClass: 'text-white', label: 'Cycle'        },
  multimodal: { bgClass: 'bg-mode-multimodal', textClass: 'text-white', label: 'Multi-mode'   },
} as const;
