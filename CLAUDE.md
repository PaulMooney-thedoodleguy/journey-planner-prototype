# CLAUDE.md — Journey Planner Prototype

AI assistant guidance for the `journey-planner-prototype` codebase.

## Project Overview

Mobile-first UK transport planning app built with React 18, TypeScript, Tailwind CSS v3, and Vite 6. Covers the full journey flow: search → results → checkout → ticket wallet, plus live departures and service updates. All data is currently served from mock services; the service layer is designed to be swapped to real TfL/National Rail APIs via an environment variable.

---

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Dev server at http://localhost:5173
npm run build         # Production build
npm run preview       # Preview the production build
npm run typecheck     # TypeScript check (no emit)
npm run setup:hooks   # Install the pre-commit secret-scanning hook
```

A Vitest unit/component suite and Playwright E2E suite were added in the QA sprint (see `vitest.config.ts` and `playwright.config.ts`). Verify changes with `npm run typecheck` and `npm run build`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v7 |
| Icons | Lucide React |
| Maps | react-leaflet v4 + Leaflet v1 (OpenStreetMap tiles) |
| Build | Vite 6 |
| Data | Mock services (swap via `VITE_USE_MOCK_DATA=false`) |

---

## Project Structure

```
src/
├── App.tsx                        # BrowserRouter + context provider tree + route definitions
├── main.tsx                       # React entry point
├── index.css                      # Global styles (Tailwind directives)
├── vite-env.d.ts                  # Vite env type declarations
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
    └── transport.tsx              # getTransportIcon, getSeverityColor/Badge, getDurationMins, getDirectionRotation
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

Run `npm run typecheck` to validate — it runs `tsc --noEmit`.

---

## Styling Conventions

- **Tailwind CSS v3** utility classes throughout
- Primary brand colour: `indigo-600` / `indigo-700` (hover)
- Page background: `bg-gradient-to-br from-blue-50 to-indigo-100`
- All pages are wrapped in `<PageShell>` — use `fullHeight` for map-heavy pages, `centered` for standalone content
- Inline `<style>` tags are acceptable within components for keyframe animations (see `SearchPage.tsx`)
- Always respect `prefers-reduced-motion`: set `animation-duration: 0.01ms !important` inside a `@media (prefers-reduced-motion: reduce)` block when adding CSS animations

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
getTransportIcon(type: TransportMode): JSX.Element
getSeverityColor(sev: Severity): string   // Tailwind class string for container
getSeverityBadge(sev: Severity): string   // Tailwind class string for dot/badge
getDirectionRotation(dir: string): number // Degrees for compass directions
getDurationMins(duration: string): number // Parses "1h 30m" → 90
```

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
