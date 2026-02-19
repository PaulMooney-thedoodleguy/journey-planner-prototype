# UK Journey Planner — Prototype

A mobile-first UK transport planning app built with React 18, TypeScript, Tailwind CSS, and Vite. Covers the full journey flow from search through to ticket wallet, plus live departures and service updates.

## Features

- **Journey Search** — Search by origin, destination, date, and time. Swap locations, pick destinations from an interactive map, and choose single or return tickets.
- **Results** — Journey options ranked and badged by fastest, cheapest, and greenest (CO₂). Multi-operator journeys show ticket breakdown per operator.
- **Checkout** — Passenger details form with validation. Proceeds to a booking confirmation.
- **Ticket Wallet** — All purchased tickets in one place. Multi-modal journeys grouped together. Each ticket has a QR code view and an animated visual validation view.
- **Live Departures** — Browse nearby stations, view real-time departure boards, and track individual services on a live map.
- **Service Updates** — Live disruption feed with severity levels (critical → low).
- **404 page** — Catch-all route for unknown URLs.

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript |
| Styling | Tailwind CSS v3 |
| Routing | React Router v7 |
| Icons | Lucide React |
| Build | Vite 6 |
| Data | Mock services (swap to real APIs via `transport.service.ts`) |

## Getting Started

```bash
npm install
npm run dev
```

App runs at **http://localhost:5173**

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run typecheck  # Run TypeScript compiler check
```

## Project Structure

```
src/
├── App.tsx                        # Router + context providers
├── types/index.ts                 # All shared TypeScript types
├── context/
│   ├── AppContext.tsx              # Purchased tickets state
│   ├── JourneyContext.tsx          # Search, results, payment flow
│   └── DeparturesContext.tsx       # Stations, departures, tracking
├── pages/
│   ├── home/                       # Search → Results → Checkout → Confirmation
│   ├── tickets/                    # Ticket wallet + ticket detail
│   ├── departures/                 # Departures → Board → Live tracking
│   └── updates/                    # Service updates
├── components/
│   ├── layout/                     # PageShell, BottomNav
│   ├── journey/                    # JourneyCard, MultiTicketBreakdown
│   ├── map/                        # MapView (stub + real Google Maps contract)
│   ├── tickets/                    # AnimatedTicketView, QRCodeView
│   └── departures/                 # LiveTrackingMap
├── services/
│   ├── transport.service.ts        # Service interfaces + mock/real factory
│   └── mock/                       # Mock journey, departures, disruptions
├── data/                           # Static mock data
└── utils/                          # formatting.ts, transport.tsx
```

## Connecting Real APIs

The service layer is designed to be swapped from mock to real with a single environment variable:

```env
VITE_USE_MOCK_DATA=false
```

Implement the interfaces in `src/services/transport.service.ts`:

- `IJourneyService` → TfL / National Rail journey planner
- `IDeparturesService` → TfL real-time departures
- `IDisruptionsService` → TfL / National Rail disruptions feed

A Google Maps API key can be added for the live map:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

Copy `.env.example` to `.env` to get started.
