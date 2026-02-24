# CLAUDE.md — Journey Planner Prototype

AI assistant guidance for the `journey-planner-prototype` codebase.

## Project Overview

Mobile-first UK transport planning app built with React 18, TypeScript, Tailwind CSS v3, and Vite 6. Covers the full journey flow: search → results → checkout → ticket wallet, plus live departures and service updates. All data is currently served from mock services; the service layer is designed to be swapped to real TfL/National Rail APIs via an environment variable.

---

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server at http://localhost:5173
npm run build            # Production build
npm run preview          # Preview the production build
npm run typecheck        # TypeScript check (no emit)
npm run setup:hooks      # Install the pre-commit secret-scanning hook

npm test                 # Vitest unit/component tests (66 tests)
npm run test:watch       # Vitest in watch mode
npm run test:coverage    # Vitest with coverage report
npm run test:e2e         # Playwright E2E: skip-link + page titles + axe audit (requires dev server)
npm run test:e2e:ui      # Playwright UI mode
```

Verify changes with `npm run typecheck` and `npm run build` before committing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v7 |
| Icons | Lucide React (UI) + react-icons/md Material Design (transport modes) |
| Maps | react-leaflet v4 + Leaflet v1 (OpenStreetMap tiles) |
| Build | Vite 6 + vite-plugin-svgr (brand logo only) |
| Data | Mock services (swap via `VITE_USE_MOCK_DATA=false`) |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright + axe-core |
| CI | GitHub Actions (typecheck → unit → build → e2e → Lighthouse) |

---

## Project Structure

```
src/
├── App.tsx                        # BrowserRouter + context provider tree + route definitions
├── main.tsx                       # React entry point
├── index.css                      # Global styles (Tailwind directives + focus-visible rules)
├── vite-env.d.ts                  # Vite env + vite-plugin-svgr type declarations
├── config/
│   └── brand.ts                   # Central branding config (app name, logo type, mode colours)
├── assets/
│   └── icons/
│       ├── brand/
│       │   └── logo.svg           # Swappable brand logo (placeholder wordmark)
│       └── modes/                 # Legacy SVG files (unused — mode icons now come from react-icons/md)
├── types/
│   └── index.ts                   # ALL shared TypeScript types (single source of truth)
├── context/
│   ├── AppContext.tsx              # Global: purchased tickets state
│   ├── JourneyContext.tsx          # Journey: search params, results, checkout flow
│   └── DeparturesContext.tsx       # Departures: nearby stations, departure board, tracking
├── pages/
│   ├── home/                      # SearchPage → ResultsPage → CheckoutPage → ConfirmationPage
│   ├── tickets/                   # TicketWalletPage, TicketDetailPage
│   ├── departures/                # DeparturesPage → DepartureBoardPage → LiveTrackingPage
│   ├── updates/                   # ServiceUpdatesPage
│   └── NotFoundPage.tsx           # Catch-all 404 route
├── components/
│   ├── layout/                    # PageShell (page wrapper), BottomNav (fixed nav bar)
│   ├── icons/                     # ModeIcon.tsx, BrandLogo.tsx
│   ├── journey/                   # JourneyCard, MultiTicketBreakdown
│   ├── map/                       # MapView (react-leaflet), MapStub (no-op placeholder)
│   ├── tickets/                   # AnimatedTicketView, QRCodeView
│   └── departures/                # LiveTrackingMap
├── services/
│   ├── transport.service.ts       # Service interfaces + factory functions
│   └── mock/                      # MockJourneyService, MockDeparturesService, MockDisruptionsService
├── data/                          # Static mock datasets (stations, journeys, departures, disruptions)
└── utils/
    ├── formatting.ts              # formatDate, formatPrice, generateReference
    └── transport.tsx              # getTransportIcon, getModeHex, getSeverityColor/Badge, getDurationMins, getDirectionRotation

src/__tests__/                     # Vitest unit/component tests (mirrors src/ structure)
e2e/                               # Playwright E2E specs (skip-link, page-titles, accessibility)
.github/workflows/ci.yml           # CI pipeline (quality → e2e → lighthouse)
lighthouserc.cjs                   # Lighthouse CI config (accessibility < 0.9 = hard fail)
public/_headers                    # Netlify security/CSP headers (copied to dist/ by Vite)
```

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `SearchPage` | Journey search form + interactive map |
| `/results` | `ResultsPage` | Journey options list |
| `/checkout` | `CheckoutPage` | Passenger details form |
| `/confirmation` | `ConfirmationPage` | Booking confirmation |
| `/tickets` | `TicketWalletPage` | All purchased tickets |
| `/tickets/:ticketId` | `TicketDetailPage` | QR code + animated validation view |
| `/departures` | `DeparturesPage` | Nearby stations list |
| `/departures/:stationId` | `DepartureBoardPage` | Real-time departure board |
| `/departures/:stationId/track/:serviceKey` | `LiveTrackingPage` | Live vehicle tracking map |
| `/updates` | `ServiceUpdatesPage` | Disruption feed |
| `*` | `NotFoundPage` | 404 catch-all |

---

## State Management

React Context API only — no Redux or external state library.

**Provider nesting order** (must be preserved — `JourneyContext` depends on `AppContext`):

```tsx
<AppProvider>          // purchased tickets
  <JourneyProvider>    // search/results/checkout (consumes AppContext via useAppContext)
    <DeparturesProvider> // stations/departures/tracking
      ...
    </DeparturesProvider>
  </JourneyProvider>
</AppProvider>
```

**Context hooks** (`useAppContext`, `useJourneyContext`, `useDeparturesContext`) throw an error if called outside their provider — this is intentional and should be preserved.

---

## Service Layer

All data access goes through factory functions in `src/services/transport.service.ts`. Never import mock services directly in components or pages.

```ts
// Correct — always use the factory
const service = await getJourneyService();
const results = await service.searchJourneys(params);

// Wrong — bypasses the mock/real toggle
import { MockJourneyService } from './mock/journey.mock';
```

**Switching to real APIs**: Set `VITE_USE_MOCK_DATA=false` and implement the three interfaces:

- `IJourneyService` → TfL / National Rail journey planner
- `IDeparturesService` → TfL real-time departures
- `IDisruptionsService` → TfL / National Rail disruptions feed

The factory functions in `transport.service.ts` contain `TODO` comments marking where real implementations should be wired in.

---

## Environment Variables

Copy `.env.example` to `.env` before running locally.

| Variable | Default | Description |
|---|---|---|
| `VITE_USE_MOCK_DATA` | `true` | Set to `false` to use real APIs |
| `VITE_GOOGLE_MAPS_API_KEY` | — | Optional; currently unused (Leaflet/OSM is the active map) |

**Never commit `.env` files.** The pre-commit hook blocks `.env`, `.env.local`, `.env.*.local`, `.env.development`, `.env.production`, and `.env.staging`.

---

## TypeScript

- **Target**: ES2020
- **JSX**: `react-jsx`
- **Path alias**: `@` → `./src` (configured in `vite.config.ts`)
- **Strict mode**: off (`"strict": false`)
- `noUnusedLocals` and `noUnusedParameters` are both off
- All shared types live in `src/types/index.ts` — add new types there, not scattered across files
- `TransportMode` union: `'train' | 'bus' | 'tube' | 'tram' | 'ferry' | 'walk' | 'cycle' | 'multimodal'`

Run `npm run typecheck` to validate — it runs `tsc --noEmit`.

---

## Styling Conventions

- **Tailwind CSS v3** utility classes throughout
- Primary brand colour: `indigo-600` / `indigo-700` (hover)
- Page background: `bg-gradient-to-br from-blue-50 to-indigo-100`
- All pages are wrapped in `<PageShell>` — use `fullHeight` for map-heavy pages, `centered` for standalone content
- Inline `<style>` tags are acceptable within components for keyframe animations (see `SearchPage.tsx`)
- Always respect `prefers-reduced-motion`: set `animation-duration: 0.01ms !important` inside a `@media (prefers-reduced-motion: reduce)` block when adding CSS animations
- **Mode icon containers**: always use inline styles with `getModeHex(mode)` from `src/utils/transport.tsx`. The standard pattern is:
  ```tsx
  style={{ backgroundColor: 'white', border: `2px solid ${getModeHex(mode)}`, color: getModeHex(mode) }}
  className="rounded-lg flex items-center justify-center"
  ```
  This white-background + coloured-border + coloured-icon style is used consistently in journey cards, leg detail rows, departure lists, ticket wallet, and map markers. Do **not** use `bg-brand-light text-brand` or `getModeContainerClasses` on mode icon containers.
- **Tailwind safelist**: `bg-mode-*` classes are safelisted in `tailwind.config.js` — these are kept for potential future use but no longer applied to icon containers

---

## Layout & Z-Index Stacking

Understanding the z-index layering is critical for the `SearchPage` map/form toggle:

| Layer | z-index |
|---|---|
| Map tiles | auto |
| `BottomNav` (fixed) | z-50 |
| Leaflet controls | ~z-1000 |
| Form overlay wrapper | z-[1500] + `pointer-events-none` |
| Map/form toggle button | z-[2000] |

The form overlay wrapper uses `pointer-events-none` so the `BottomNav` remains clickable despite the overlay sitting at a higher z-index. Any interactive element inside the overlay must re-enable `pointer-events-auto` explicitly.

---

## Branding Configuration

All brand decisions live in **`src/config/brand.ts`** — the single source of truth.

```ts
BRAND_META   // appName, tagline
BRAND_LOGO   // type: 'text' | 'svg' | 'image', src, alt, width, height
MODE_CONFIG  // per-mode bgClass, textClass, hex, label
```

**`MODE_CONFIG.hex`** is the canonical colour for each transport mode. Always retrieve it via `getModeHex(mode)` from `src/utils/transport.tsx` rather than accessing `MODE_CONFIG` directly in components.

**Swapping the logo**: change `BRAND_LOGO.type`:
- `'text'` (default) — renders the current Train icon + text (no file change needed)
- `'svg'` — renders `src/assets/icons/brand/logo.svg` as a React component via svgr
- `'image'` — renders an `<img>` using `BRAND_LOGO.src`

**`BrandLogo`** (`src/components/icons/BrandLogo.tsx`) reads `BRAND_LOGO` and renders the correct variant. Used in `TopNav.tsx`.

**`ModeIcon`** (`src/components/icons/ModeIcon.tsx`) — renders a Google Material Design icon for a given `TransportMode` using `react-icons/md`. The exported `ICONS` map is the single definition of which icon represents each mode:

```ts
// ModeIcon.tsx
export const ICONS: Record<string, IconType> = {
  train: MdTrain, bus: MdDirectionsBus, tram: MdTram, ferry: MdDirectionsBoat,
  tube: MdDirectionsSubway, walk: MdDirectionsWalk, cycle: MdDirectionsBike,
  multimodal: MdSyncAlt,
};
```

**Map markers** (`MapView.tsx`) reuse the same `ICONS` map via `renderToStaticMarkup(createElement(Icon, { size, color }))` to generate HTML strings for Leaflet `divIcon`. This means changing an icon in `ModeIcon.tsx` automatically updates both card icons and map pins.

**SVG imports** (`vite-plugin-svgr`): only used for `src/assets/icons/brand/logo.svg?react` in `BrandLogo.tsx`. The `src/assets/icons/modes/` SVG files are legacy and no longer imported. `svgr()` must be present in **both** `vite.config.ts` and `vitest.config.ts`.

---

## Key Utilities

### `src/utils/formatting.ts`

```ts
formatDate(isoDate: string): string
// Parses as local midnight to avoid UTC-offset display bugs.
// Use new Date(y, m-1, d) NOT new Date('YYYY-MM-DD').

formatPrice(amount: number): string   // Returns "£X.XX"
generateReference(): string           // Returns "UKXXXXXX" booking ref
```

### `src/utils/transport.tsx`

```ts
getTransportIcon(type: TransportMode, className?): JSX.Element
// Returns <ModeIcon> for the given mode — Google Material Design icon via react-icons/md

getModeHex(type: TransportMode): string
// Returns raw hex colour for a mode from MODE_CONFIG (e.g. '#003078' for train)
// Use this to build inline-style icon containers (white bg + coloured border + coloured icon)

getSeverityColor(sev: Severity): string   // Tailwind class string for container
getSeverityBadge(sev: Severity): string   // Tailwind class string for dot/badge
getDirectionRotation(dir: string): number // Degrees for compass directions
getDurationMins(duration: string): number // Parses "1h 30m" → 90
```

> `getModeContainerClasses` still exists in the file but is no longer used — all icon containers use `getModeHex` + inline styles.

---

## CI / CD & Quality Gates

GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push/PR to `master`:

| Job | Depends on | Steps |
|---|---|---|
| `quality` | — | typecheck → `npm test` (66 unit tests) → `npm run build` → upload dist artefact |
| `e2e` | quality | install Playwright → `npm run test:e2e` (skip-link + page titles + axe audit) |
| `lighthouse` | quality | download dist artefact → `npx @lhci/cli autorun` |

**Lighthouse thresholds** (`lighthouserc.cjs`):
- Accessibility `< 0.9` → **hard failure** (blocks PR)
- Performance `< 0.7` → warning only
- Best practices `< 0.8` → warning only
- SEO `< 0.7` → warning only

**Axe accessibility audit** (`e2e/accessibility.spec.ts`): runs WCAG 2.2 AA checks against `/`, `/tickets`, `/departures`, `/updates`. Leaflet map container is excluded (third-party HTML). Zero violations required.

**ARIA `aria-controls` pattern**: never set `aria-controls` to reference an element that isn't currently in the DOM — axe flags this as a critical `aria-valid-attr-value` violation. For combobox/listbox patterns, make `aria-controls` conditional: `aria-controls={isOpen ? listboxId : undefined}`. The matching `aria-owns` on the combobox wrapper must follow the same condition.

**Security headers** (`public/_headers`): Netlify format, copied to `dist/` by Vite. Key decisions:
- `style-src 'unsafe-inline'` — required by Leaflet inline styles; tighten with nonces if SSR is added
- `img-src *.tile.openstreetmap.org` — react-leaflet OSM tile images
- `worker-src blob:` — Workbox service worker runtime caching
- For Vercel: translate to the `headers` array in `vercel.json`

---

## Pre-commit Hook

Install once after cloning:

```bash
npm run setup:hooks
```

The hook (`scripts/pre-commit`) blocks commits that contain:
- Common secret patterns: Google API keys (`AIza…`), AWS access keys (`AKIA…`), OpenAI keys (`sk-…`), GitHub tokens (`ghp_`, `ghs_`), PEM private keys
- `.env` files (any variant except `.env.example`)

If a false positive occurs, adjust the `SECRET_PATTERNS` regex in `scripts/pre-commit`.

---

## Adding New Features

### New page
1. Create `src/pages/<section>/<PageName>.tsx`
2. Export a default React component
3. Wrap with `<PageShell>` (add `fullHeight` if map-heavy)
4. Add a `<Route>` in `src/App.tsx`

### New API / service operation
1. Add the method to the relevant interface in `src/services/transport.service.ts`
2. Implement it in the mock class under `src/services/mock/`
3. Mark a `// TODO:` for the real implementation

### New transport mode
1. Add to `TransportMode` union in `src/types/index.ts`
2. Add entry to `MODE_CONFIG` in `src/config/brand.ts` — include `bgClass`, `textClass`, `hex`, `label`
3. Add colour token to `tailwind.config.js` under `theme.extend.colors.mode` and to the `safelist`
4. Import the relevant `react-icons/md` icon and add it to the `ICONS` map in `ModeIcon.tsx`

No SVG file is needed — icons come from `react-icons/md`.

### New shared type
- Add to `src/types/index.ts` only

### New utility function
- Pure JS/TS helpers → `src/utils/formatting.ts`
- React/JSX helpers returning elements or Tailwind strings → `src/utils/transport.tsx`

---

## Known Limitations / Future Work

- Real TfL / National Rail API integrations are not implemented (all services are mocked)
- Google Maps integration is wired up in `MapViewProps` but the active implementation uses react-leaflet with OpenStreetMap tiles
- PWA service worker is only active in production builds (`devOptions.enabled: false`); test offline behaviour with `npm run build && npm run preview`
- Lighthouse CI uploads reports to `temporary-public-storage` (no account needed, reports expire); switch to a self-hosted LHCI server for persistent score history
- `style-src 'unsafe-inline'` in the CSP is required by Leaflet — if SSR is ever added, replace with a nonce-based approach
