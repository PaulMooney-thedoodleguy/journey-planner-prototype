# UX Competitive Analysis: Journey Planner Prototype

**Prepared:** February 2026
**Standards:** WCAG 2.2 AA · GDS Design System · Digital Scotland Design System (DSDS)
**Scope:** Full journey flow — search → results → checkout → confirmation → ticket wallet → departures → service updates

---

## A. Executive Summary

The UK public transport planning market is dominated by functional but dated products. Most journey planners were designed for desktop and retro-fitted for mobile; they treat accessibility as a compliance checkbox rather than a design principle; and they offer no meaningful personalisation, sustainability signalling, or delight. The prototype already leads the market on visual quality and mobile-first thinking, but has significant accessibility debt and is missing several features that users expect as table stakes.

### The 5 Biggest Opportunities

1. **Full WCAG 2.2 AA compliance** — No competitor fully passes. Being the only accessible journey planner in Scotland is a strong differentiator and a legal requirement for any public-sector deployment.
2. **Station autocomplete with typeahead** — Every major competitor offers this. The prototype requires exact-text entry. This is the single highest friction point in the core flow and the highest-ROI frontend task.
3. **GDS/DSDS-compliant form patterns** — Labels not programmatically associated with inputs, missing `aria-describedby` on errors, no skip link, no `<main>` landmark. These are fixable in hours and unlock screen reader users.
4. **Journey leg detail & intermediate stops** — TfL and National Rail show walking times, platform changes, and intermediate stops inline. Traveline Scotland buries this behind a secondary tap. Showing it by default reduces missed connections.
5. **Disruption-aware journey results** — None of the competitors surface disruptions inline on the results page. Showing a banner when a chosen route has an active disruption would be a genuine market differentiator.

### What the Market Does Well
- Real-time departure data (TfL, National Rail, ScotRail)
- Multi-modal journey planning with clear leg breakdowns (TfL)
- Accessible timetable PDFs (National Rail, Traveline)
- Railcard and passenger type pricing (National Rail, ScotRail)

### What the Market Does Poorly
- Mobile-first design (most are desktop-first retrofits)
- Accessibility (all fail multiple WCAG 2.2 AA criteria)
- Sustainability / CO₂ signalling (prototype already leads here)
- Visual design quality and modern UI
- Onboarding for first-time users

---

## B. Traveline Scotland — Detailed UX Review

**Product:** Traveline Scotland Journey Planner (travelinescotland.com)
**Technology:** Ionic/Angular web app, Source Sans Pro typography, mobile-first Ionic components
**Assessment date:** February 2026

### B1. Nielsen 10-Heuristic Evaluation

| # | Heuristic | Rating (1–5) | Notes |
|---|-----------|:---:|-------|
| 1 | Visibility of system status | 2 | Loading states exist but are inconsistent. No progress indicator during journey search. Departure boards show live status but with poor visual hierarchy. |
| 2 | Match between system and real world | 3 | Uses "From" / "To" labelling consistent with mental models. "Leaving" / "Arriving" modes are clear. However, journey results use internal operator codes unfamiliar to users. |
| 3 | User control and freedom | 2 | No persistent "Back" affordance in the app flow. Modifying a search mid-results requires returning to home. No undo for form clearing. |
| 4 | Consistency and standards | 3 | Ionic components are internally consistent. However, the visual design diverges from both GDS and DSDS standards significantly. Inconsistent button styles across sections. |
| 5 | Error prevention | 2 | Date/time fields accept past dates without warning. No confirmation before clearing a journey. No guard against invalid station combinations. |
| 6 | Recognition rather than recall | 2 | No station autocomplete or recent searches. Users must recall and type full station names exactly. No suggested popular routes. |
| 7 | Flexibility and efficiency | 2 | No keyboard shortcuts. No saved frequent journeys. No quick-select for "now" in time field. Power users have no accelerators. |
| 8 | Aesthetic and minimalist design | 3 | The Ionic design is clean but generic. Colour use is flat. Information density on results is too low — users must tap through to see leg detail. |
| 9 | Help users recognise/recover from errors | 2 | Error messages are brief and not specific. "No results" state does not suggest alternatives. Error text is small and low contrast. |
| 10 | Help and documentation | 2 | No contextual help. FAQ is a separate static page. No tooltips or inline guidance for complex inputs (e.g. via-point). |

**Total: 23/50** — Below average. The product is usable but falls well short of contemporary UX expectations.

### B2. WCAG 2.2 AA Audit

| Criterion | Level | Status | Notes |
|-----------|:-----:|:------:|-------|
| 1.1.1 Non-text Content | A | ⚠ Partial | Icons lack accessible names. Logo has `alt=""` (acceptable) but functional icons have no `aria-label`. |
| 1.3.1 Info and Relationships | A | ✗ Fail | Form labels not programmatically associated with inputs. Visual groupings not marked up with `fieldset`/`legend`. |
| 1.3.2 Meaningful Sequence | A | ✓ Pass | Reading order follows visual order. |
| 1.3.5 Identify Input Purpose | AA | ✗ Fail | No `autocomplete` attributes on name, email, or date inputs. |
| 1.4.1 Use of Colour | A | ✓ Pass | Status indicators use both colour and text/icon. |
| 1.4.3 Contrast (Minimum) | AA | ⚠ Partial | Secondary text (grey on white) fails 4.5:1 in several places. Active tab indicator insufficient contrast. |
| 1.4.4 Resize Text | AA | ✓ Pass | Content reflows at 200% zoom. |
| 1.4.10 Reflow | AA | ✓ Pass | Single column at 320px. |
| 1.4.11 Non-text Contrast | AA | ✗ Fail | Input borders (light grey on white) fail 3:1 ratio. |
| 1.4.12 Text Spacing | AA | ✓ Pass | Layout holds with increased letter/word spacing. |
| 2.1.1 Keyboard | A | ✗ Fail | Map interaction not keyboard accessible. Modal drawers trap focus inconsistently. |
| 2.4.1 Bypass Blocks | A | ✗ Fail | No skip link to main content. |
| 2.4.3 Focus Order | A | ⚠ Partial | Logical in most flows; modal overlay breaks focus order. |
| 2.4.7 Focus Visible | AA | ✗ Fail | Default browser focus ring suppressed. Custom focus styles absent. |
| 2.4.11 Focus Not Obscured (Min) | AA | ✗ Fail | Bottom navigation bar obscures focused elements in the scroll area. |
| 3.3.1 Error Identification | A | ⚠ Partial | Errors shown but not linked to fields via `aria-describedby`. Not announced to screen readers. |
| 3.3.2 Labels or Instructions | A | ✗ Fail | Several inputs have visual labels not programmatically linked. |
| 4.1.2 Name, Role, Value | A | ✗ Fail | Custom Ionic components do not always expose correct ARIA roles. Interactive elements missing accessible names. |
| 4.1.3 Status Messages | AA | ✗ Fail | Loading states and result counts not announced via `aria-live`. |

**Result: 5 Pass, 4 Partial, 10 Fail** — Traveline Scotland does not meet WCAG 2.2 AA.

### B3. Mobile & Responsive Experience

- Ionic framework gives a native-app feel on iOS/Android Chrome ✓
- Bottom navigation bar matches mobile OS conventions ✓
- Touch targets generally meet 44×44px minimum ✓
- The journey results list is difficult to scan — too much horizontal scrolling required for leg details ✗
- The date/time picker relies on native browser/OS controls — inconsistent cross-platform ✗
- Font size on results (12–13px for secondary info) is too small for comfortable mobile reading ✗

### B4. Information Architecture

```
Home
├── Plan a Journey (primary flow)
│   ├── Search form
│   ├── Results list
│   │   └── Journey detail → (external booking or timetable)
│   └── No integrated purchasing
├── Timetables (separate static lookup)
├── My Journeys (saved journeys — login required)
└── More
    ├── Disruptions (separate page, not surfaced in results)
    ├── Map (standalone, not integrated into planning)
    └── Accessibility information
```

**IA Issues:**
- Disruptions are siloed — not surfaced alongside affected journey results
- No integrated ticketing — hands off to operator websites
- Map and planning are separate experiences — no "plan on the map" workflow
- Login required for saved journeys creates a barrier for casual users

### B5. User Flow Friction Points

| Step | Friction Point | Severity |
|------|----------------|:--------:|
| Station entry | No autocomplete — must type exact name | Critical |
| Date/time | No "depart now" shortcut | Medium |
| Results | No filtering or sorting | High |
| Results | Journey leg detail requires secondary tap | Medium |
| Results | No price shown until tapping through to operator site | Critical |
| Booking | Redirected to multiple operator sites | High |
| Disruptions | Not visible during journey planning flow | High |
| My Journeys | Requires account creation | Medium |

### B6. Visual Design

- Clean but generic Ionic defaults — no distinctive brand personality
- Colour palette is Traveline corporate teal — adequate contrast but uninspiring
- Typography (Source Sans Pro) is readable and appropriate for transport
- Journey result cards are information-dense but visually flat — difficult to scan
- No iconography system beyond Material Icons — icons not always transport-appropriate
- Dark mode: not supported

### B7. Strengths and Weaknesses

**Strengths:**
- Mobile-optimised Ionic app feel
- Wide coverage of Scottish bus, rail, and ferry services
- Live departure data integrated
- Timetable downloads available
- Accessible travel information page exists

**Weaknesses:**
- No station autocomplete (critical friction)
- No integrated ticketing
- Poor WCAG compliance
- Disruptions not surfaced in journey flow
- No passenger type / railcard pricing
- No journey sharing or saving without account
- Outdated visual design

---

## C. Competitor Comparison Matrix

Scale: 1 (poor) → 5 (excellent)

| Dimension | **Our Prototype** | Traveline Scotland | Traveline E&W | TfL Journey Planner | ScotRail | National Rail |
|-----------|:-----------------:|:------------------:|:-------------:|:-------------------:|:--------:|:-------------:|
| Search UX | 2 | 2 | 2 | 4 | 3 | 4 |
| Station autocomplete | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Results clarity | 3 | 2 | 2 | 4 | 3 | 3 |
| Journey leg detail | 2 | 2 | 3 | 5 | 3 | 4 |
| Disruption integration | 2 | 1 | 2 | 4 | 3 | 3 |
| Ticket/booking flow | 3 | 1 | 1 | 3 | 4 | 5 |
| Accessibility (WCAG AA) | 2 | 1 | 2 | 3 | 2 | 3 |
| Mobile experience | 4 | 3 | 2 | 4 | 4 | 3 |
| GDS compliance | 1 | 1 | 2 | 2 | 1 | 2 |
| DSDS compliance | 1 | 1 | N/A | N/A | 1 | N/A |
| Visual design quality | 4 | 2 | 2 | 3 | 3 | 2 |
| CO₂ / sustainability | 5 | 1 | 1 | 2 | 1 | 1 |
| Passenger type pricing | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Saved journeys | ✗ | ✓ (login) | ✗ | ✓ (login) | ✓ (login) | ✗ |
| Live departures | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ |
| Map-integrated planning | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |

**Key observations:**
- Our prototype leads on visual design, mobile experience, CO₂ signalling, and map integration
- We trail significantly on accessibility, GDS/DSDS compliance, and station autocomplete
- TfL is the strongest overall competitor — sets the bar for journey leg detail and disruption surfacing
- National Rail leads on booking flow completeness
- No competitor scores well on both accessibility AND visual design — a clear whitespace opportunity

---

## D. GDS & DSDS Compliance Audit

### D1. GOV.UK Design System

#### Typography
| Pattern | GDS Standard | Prototype Status | Traveline Scotland Status |
|---------|-------------|:----------------:|:------------------------:|
| Body font | GDS Transport or system font, 19px minimum | ✗ Source Sans Pro, 16px base | ✗ Source Sans Pro, smaller base |
| Heading scale | Specific px sizes (48/36/27/24/19) | ✗ Custom Tailwind scale | ✗ Ionic defaults |
| Line height | 1.25 headings, 1.5 body | ✓ Approximated via Tailwind | ⚠ Partial |
| Font weight for labels | Bold (700) | ✗ Medium (500) — `text-sm font-medium` | ✗ Regular weight |

#### Colour
| Pattern | GDS Standard | Prototype Status |
|---------|-------------|:----------------:|
| Focus colour | Yellow (#FFDD00) with black border | ✗ Brand blue ring — no yellow focus |
| Error colour | Red (#D4351C) | ✗ Tailwind `red-600` (#DC2626) — close but not standard |
| Link colour | Blue (#1D70B8) | ✗ Brand blue (#0054E9) |
| Success colour | Green (#00703C) | ⚠ Green-100/Green-600 used but not standard GDS green |

#### Forms
| Pattern | GDS Standard | Prototype Status |
|---------|-------------|:----------------:|
| Label position | Above input, bold, full width | ✗ Above input but `font-medium` not `font-bold`; `text-sm` too small |
| Label–input association | `<label htmlFor>` required | ✗ Labels present visually but `htmlFor` missing on all form inputs |
| Hint text | Below label, above input, grey | ✗ Not implemented — placeholder text used instead |
| Error message | Red, bold, above input, with ✗ prefix | ✗ Below input, `text-xs`, no icon prefix, not linked via `aria-describedby` |
| Error summary | Box at top of form listing all errors | ✗ Not implemented |
| Input width | Match expected data length | ✗ Full width for all inputs including card number |
| Fieldset/legend for groups | Required for radio buttons, checkboxes | ✗ Ticket type radios have no `<fieldset>/<legend>` |
| Form element | `<form>` element with submit | ✗ CheckoutPage uses divs + onClick, not a `<form>` |

#### Components
| Component | GDS Pattern | Prototype Status |
|-----------|------------|:----------------:|
| Back link | `← Back` as a specific component, not a button | ⚠ Implemented as styled text link — acceptable but inconsistent |
| Button | Primary (blue), secondary (grey), warning (red) | ✓ Brand blue primary, grey secondary used correctly |
| Tag/badge | Specific colours for status | ⚠ Custom status badges — not GDS-compliant colours |
| Details (expand/collapse) | `<details>/<summary>` pattern | ✗ Custom chevron accordion — not using native element |
| Skip link | First element, visible on focus | ✗ Missing entirely |
| Notification banner | For errors, warnings, success at page level | ✗ Missing — errors only shown at field level |

### D2. Digital Scotland Design System (DSDS)

The DSDS (designsystem.gov.scot) is built for Scottish Government services and extends GDS principles with Scottish-specific guidance.

| Area | DSDS Requirement | Prototype Status |
|------|-----------------|:----------------:|
| Digital Scotland Service Standard | 14-point checklist for public services | ✗ Not assessed against — no evidence of user research, accessibility testing, or iterative design |
| Scottish brand colours | Flexible but must meet contrast requirements | ⚠ Brand blue passes contrast for large text but borderline for small text |
| Bilingual content | Gaelic equivalents for Scottish Government services | ✗ No bilingual support |
| Component library | Use DSDS components where available | ✗ Custom Tailwind components used throughout |
| Focus styles | High-contrast yellow focus ring (matching GDS) | ✗ Missing |
| Error patterns | Match DSDS error patterns | ✗ Does not match |
| Page title pattern | `<title>` must describe the page | ⚠ Single `<title>UK Journey Planner</title>` — does not update per route |

---

## E. Gap Analysis & Opportunities

### E1. Features Competitors Have That We Lack

| Feature | Who Has It | Priority |
|---------|-----------|:--------:|
| Station/stop autocomplete with typeahead | TfL, National Rail, ScotRail | P1 — Critical |
| Passenger type selection (adult/child/railcard) | TfL, National Rail, ScotRail | P2 — High |
| Journey leg intermediate stops | TfL, National Rail | P2 — High |
| Results sorting (time / price / duration) | TfL, National Rail | P2 — High |
| Journey sharing (link / social) | TfL | P3 — Medium |
| Saved/recent journeys (no login required) | Some competitors (with login) | P3 — Medium |
| Print / download journey details | National Rail, Traveline | P3 — Medium |
| Platform information on results | National Rail, TfL | P2 — High |
| Fare breakdown (peak/off-peak explanation) | National Rail | P2 — High |
| Walking time between connections | TfL | P2 — High |

### E2. Whitespace — What No Competitor Does Well

| Opportunity | Why It Matters |
|-------------|----------------|
| **Inline disruption warnings on results** | All competitors silo disruptions. Showing a banner on a result card for an affected route would genuinely help users avoid problems. |
| **CO₂ comparison across all results** | We already show this — no competitor does. Opportunity to expand to comparative labelling (e.g. "70% less CO₂ than driving"). |
| **Fully WCAG 2.2 AA compliant journey planner** | No competitor passes. First-mover advantage in accessibility compliance. |
| **Offline-capable ticket wallet** | Tickets are only available when online. A PWA with cached tickets would be a genuine differentiator. |
| **Railcard/discount quick-apply** | Users with railcards must remember to select them on every search. Persistent preference with one-tap application is unexplored. |

---

## F. Prioritised Recommendations

### Priority 1 — Critical (Accessibility & Core Flow Blockers)

---

#### P1-1: Add skip link and `<main>` landmark
**What:** Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` as the first child of the app root. Add `id="main-content"` to the content area in `PageShell`.
**Why:** WCAG 2.4.1 (Bypass Blocks) — Level A failure. Screen reader and keyboard users cannot skip the bottom navigation repetition.
**Files:** `src/components/layout/PageShell.tsx`, `src/App.tsx`
**Acceptance criteria:**
- Tab from address bar reaches the skip link first
- Skip link is invisible until focused, then appears above all content
- Activating it moves focus to `#main-content`
- `<main id="main-content">` wraps page content in PageShell

---

#### P1-2: Associate all form labels with inputs via `htmlFor`/`id`
**What:** Add matching `id` props to all `<input>` elements and `htmlFor` to all `<label>` elements across SearchPage and CheckoutPage.
**Why:** WCAG 1.3.1 (Info and Relationships) and 3.3.2 (Labels or Instructions) — Level A failures. Screen readers cannot announce which label belongs to which field.
**Files:** `src/pages/home/SearchPage.tsx`, `src/pages/home/CheckoutPage.tsx`
**Acceptance criteria:**
- All inputs have unique `id` attributes
- All labels have `htmlFor` matching the associated input `id`
- Clicking a label focuses the corresponding input

---

#### P1-3: Link error messages to inputs via `aria-describedby` and add `role="alert"`
**What:** For each inline error `<p>`, add a unique `id` and reference it from the input via `aria-describedby`. Add `role="alert"` or `aria-live="polite"` to the error container.
**Why:** WCAG 1.3.1, 3.3.1 (Error Identification), 4.1.3 (Status Messages) — errors are visually shown but never announced to screen readers.
**Files:** `src/pages/home/SearchPage.tsx`, `src/pages/home/CheckoutPage.tsx`
**Acceptance criteria:**
- Screen reader announces error text when it appears
- Error text is programmatically associated with the invalid input
- `aria-invalid="true"` set on inputs with errors

---

#### P1-4: Add visible focus styles to BottomNav and all interactive elements
**What:** Add `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400` (or a high-contrast brand equivalent) to all button and link elements.
**Why:** WCAG 2.4.7 (Focus Visible) and 2.4.11 (Focus Not Obscured) — Level AA failures. Keyboard-only users cannot see where they are on the page.
**Files:** `src/components/layout/BottomNav.tsx`, `src/pages/home/SearchPage.tsx`, `src/pages/home/CheckoutPage.tsx`, `src/pages/home/ResultsPage.tsx`, `tailwind.config.js`
**Acceptance criteria:**
- Tabbing through the app shows a clear visible focus indicator on every interactive element
- Focus ring has at least 3:1 contrast against adjacent colours (WCAG 2.4.11)
- Focus ring uses `focus-visible` (not `focus`) to avoid showing on mouse click

---

#### P1-5: Add `autocomplete` attributes to all form inputs
**What:** Add appropriate `autocomplete` attribute values: `autocomplete="name"` (name field), `autocomplete="email"` (email), `autocomplete="cc-number"` (card number). Add `inputmode="numeric"` to card number.
**Why:** WCAG 1.3.5 (Identify Input Purpose) — Level AA failure. Prevents browser autofill from working, creating friction especially on mobile.
**Files:** `src/pages/home/CheckoutPage.tsx`
**Acceptance criteria:**
- Browser autofill works for name and email on CheckoutPage
- `inputmode="numeric"` shows numeric keyboard on mobile for card number

---

#### P1-6: Wrap CheckoutPage fields in a `<form>` element
**What:** Replace the outer `<div>` container in CheckoutPage with `<form onSubmit={handlePayment}>` and change the pay button to `type="submit"`.
**Why:** WCAG 4.1.2 (Name, Role, Value) and standard HTML semantics. Screen readers announce form context. Mobile keyboards show the correct "Done/Submit" action. Pressing Enter submits the form.
**Files:** `src/pages/home/CheckoutPage.tsx`
**Acceptance criteria:**
- Pressing Enter in any field submits the form
- Screen readers announce the form context
- Submit button has `type="submit"`

---

#### P1-7: Add `<fieldset>` and `<legend>` to ticket type radio group
**What:** Wrap the Single/Return radio buttons in `<fieldset><legend>Ticket Type</legend>...</fieldset>`. Remove the separate `<label>` above the group.
**Why:** WCAG 1.3.1 — radio groups without fieldset/legend leave screen reader users without group context.
**Files:** `src/pages/home/SearchPage.tsx`
**Acceptance criteria:**
- Screen reader announces "Ticket Type" as the group label when entering the radio buttons
- Individual radio labels ("Single", "Return") are still announced

---

### Priority 2 — High (Significant UX Wins)

---

#### P2-1: Station autocomplete with typeahead
**What:** Replace plain text inputs for From/To with a component that shows a filtered dropdown of matching stations from `MAP_STATIONS` as the user types (minimum 2 characters). Keyboard navigable (arrow keys, Enter to select, Escape to close).
**Why:** The single highest-friction point in the core user flow. Every major competitor has this. `MAP_STATIONS` data is already loaded on the page.
**Files:** `src/pages/home/SearchPage.tsx`, new component `src/components/journey/StationAutocomplete.tsx`
**Acceptance criteria:**
- Typing 2+ characters shows a filtered list of matching station names
- Arrow keys navigate the list
- Enter or click selects a station and populates the field
- Escape closes the dropdown
- Dropdown is keyboard accessible with correct ARIA (`role="combobox"`, `aria-expanded`, `role="listbox"`)

---

#### P2-2: Results page sorting and filtering
**What:** Add sort controls above the results list: "Fastest", "Cheapest", "Greenest" (matching the existing badge labels). Optionally add a filter for transport mode (train/bus/tube).
**Why:** Users with specific constraints (budget, time, environmental) cannot currently optimise their selection. TfL and National Rail both offer this.
**Files:** `src/pages/home/ResultsPage.tsx`
**Acceptance criteria:**
- Three sort options visible above results
- Default sort is by departure time
- Selecting a sort option re-orders the list immediately
- Active sort option is visually highlighted
- Sort state is preserved if user presses Back from Checkout

---

#### P2-3: Journey leg detail inline on results
**What:** Expand each `JourneyCard` to show leg-level detail inline (or in an expandable section): departure platform, operator per leg, walking time between connections, and intermediate stops count.
**Why:** Users currently cannot assess connection complexity without going to checkout. Missed connections are the #1 user complaint for multi-change journeys.
**Files:** `src/components/journey/JourneyCard.tsx`, `src/types/index.ts` (JourneyLeg already has the data)
**Acceptance criteria:**
- Each leg shows: mode icon, from → to, departure/arrival time, operator
- Walking connections show estimated walk time
- Multi-leg journeys show a timeline view
- Collapsed by default for single-leg journeys, expanded by default for 2+ changes

---

#### P2-4: Disruption banner on affected journey results
**What:** In ResultsPage, fetch active disruptions and cross-reference with each journey's route. Show an inline warning banner on affected JourneyCards.
**Why:** No competitor does this. Users selecting a disrupted route have no warning until they check the separate updates page.
**Files:** `src/pages/home/ResultsPage.tsx`, `src/services/transport.service.ts`, `src/services/mock/disruptions.mock.ts`
**Acceptance criteria:**
- If a journey's from/to/operator matches an active high/critical disruption, a yellow warning banner appears on the card
- Banner shows disruption title and links to ServiceUpdatesPage
- Disruption data is fetched once on ResultsPage mount

---

#### P2-5: Update `<title>` per route
**What:** Use `document.title` (or a title management approach) to set a descriptive page title on each route: e.g. "Plan Your Journey — UK Journey Planner", "Journey Results — London to Edinburgh".
**Why:** WCAG 2.4.2 (Page Titled) — Level A. Single-page apps frequently fail this. Screen readers announce the page title on navigation. Browser history and bookmarks are more usable.
**Files:** `src/App.tsx` or a custom hook `src/hooks/usePageTitle.ts`
**Acceptance criteria:**
- Each route has a unique, descriptive `<title>`
- Title updates on navigation without page reload
- Format: `{Page Name} — UK Journey Planner`

---

#### P2-6: Booking reference displayed on ConfirmationPage
**What:** Display the generated booking reference prominently on the ConfirmationPage.
**Why:** Users expect to see and note their reference number for customer service enquiries. It is generated (`generateReference()`) but never shown on the confirmation screen.
**Files:** `src/pages/home/ConfirmationPage.tsx`, `src/context/JourneyContext.tsx`
**Acceptance criteria:**
- Booking reference displayed prominently below the "Booking Confirmed!" heading
- Reference is also visible in the TicketDetailPage

---

#### P2-7: Error summary box at top of forms
**What:** When form validation fails, show a GDS-style error summary box at the top of the form listing all errors with anchor links to the affected fields.
**Why:** GDS and DSDS both require error summaries. Users with low vision or cognitive disabilities benefit from a consolidated list. Focus should move to the summary on submit failure.
**Files:** `src/pages/home/SearchPage.tsx`, `src/pages/home/CheckoutPage.tsx`
**Acceptance criteria:**
- Error summary appears at the top of the form when validation fails
- Summary lists each error as an anchor link to the affected field
- Focus moves to the summary on submit failure
- Summary disappears when all errors are resolved

---

#### P2-8: `aria-live` region for search/departure loading states
**What:** Add an `aria-live="polite"` region that announces loading and result states: "Searching for journeys…", "5 journeys found", "No journeys found for this route".
**Why:** WCAG 4.1.3 (Status Messages) — Level AA. Screen reader users currently receive no feedback that a search is in progress or has completed.
**Files:** `src/pages/home/ResultsPage.tsx`, `src/pages/departures/DepartureBoardPage.tsx`
**Acceptance criteria:**
- Screen reader announces when search begins
- Screen reader announces result count when results load
- Screen reader announces "No results found" message

---

### Priority 3 — Medium (Polish and Differentiation)

---

#### P3-1: CO₂ comparison label ("X% less than driving")
**What:** Extend the CO₂ display on JourneyCard to show comparative context, e.g. "82% less CO₂ than an equivalent car journey".
**Why:** The prototype already leads the market on sustainability signalling. Adding context makes the figure meaningful to users who don't know what 2.3kg CO₂ means.
**Files:** `src/components/journey/JourneyCard.tsx`, `src/data/journeys.ts`
**Acceptance criteria:**
- Each journey shows CO₂ vs estimated car equivalent
- Percentage calculated from `co2` value vs a configurable baseline car figure
- GreenBadge styling used consistently

---

#### P3-2: Recent searches (localStorage, no login required)
**What:** Store the last 5 origin/destination pairs in localStorage. Show them as quick-select options below the From/To fields on SearchPage.
**Why:** Repeat journeys are the most common use case. TfL and ScotRail offer this with login — we can offer it without.
**Files:** `src/pages/home/SearchPage.tsx`, new util `src/utils/recentSearches.ts`
**Acceptance criteria:**
- After a successful search, the pair is saved to localStorage
- Up to 5 recent searches shown on SearchPage
- Tapping a recent search pre-fills both From and To fields
- Recent searches can be individually dismissed

---

#### P3-3: "Depart now" shortcut in time field
**What:** Add a "Now" button adjacent to the time input that sets the date to today and time to the current time (rounded to next 5 minutes).
**Why:** The most common use case is "I want to travel right now". Requiring users to manually set date and time is unnecessary friction.
**Files:** `src/pages/home/SearchPage.tsx`
**Acceptance criteria:**
- "Now" button sets date to today and time to current time + 5 minutes (rounded)
- Button is clearly associated with the date/time group
- Works correctly at midnight/date boundaries

---

#### P3-4: Passenger type selector (Adult / Child / Railcard)
**What:** Add a passenger count/type selector to SearchPage: Adult, Child (5–15), and common railcard types (16–25, Senior, Disabled). Pass selection through to pricing.
**Why:** Families and railcard holders cannot get accurate pricing without this. National Rail and ScotRail both provide it. Mock pricing can apply simple multipliers.
**Files:** `src/pages/home/SearchPage.tsx`, `src/types/index.ts` (extend `JourneySearchParams`), `src/services/mock/journey.mock.ts`
**Acceptance criteria:**
- Passenger selector accessible from SearchPage
- Selection persists through results and checkout
- Price shown on results adjusts for passenger type
- Child prices shown as approximately 50% of adult

---

#### P3-5: Platform information on DepartureBoardPage
**What:** The `Departure` type already has a `platform` field. Surface this more prominently — show a platform badge/chip next to the departure time rather than in the grid column only.
**Why:** Platform number is critical information for rail travellers. Current presentation buries it in a responsive grid that disappears on mobile.
**Files:** `src/pages/departures/DepartureBoardPage.tsx`
**Acceptance criteria:**
- Platform number always visible on mobile (not hidden in responsive grid)
- Displayed as a visually distinct chip/badge
- "TBA" shown when platform is null

---

#### P3-6: PWA manifest and offline ticket caching
**What:** Add a `manifest.json`, service worker (Vite PWA plugin), and cache purchased ticket data so the ticket wallet works offline.
**Why:** Transport use case is inherently offline — users in tunnels, poor signal areas, or roaming need their tickets accessible.
**Files:** `vite.config.ts`, new `public/manifest.json`, new service worker registration
**Acceptance criteria:**
- App installable on iOS and Android home screen
- Purchased tickets visible in TicketWalletPage when offline
- QR code renders offline from cached ticket data

---

## G. Agent Work Breakdown

### `react-nextjs-frontend-engineer`

| Task ID | Description | Files | Effort | Dependencies |
|---------|-------------|-------|:------:|:-------------|
| FE-1 | Add skip link + `<main id="main-content">` to PageShell | `PageShell.tsx`, `index.css` | S | — |
| FE-2 | Add `htmlFor`/`id` to all SearchPage labels + inputs | `SearchPage.tsx` | S | — |
| FE-3 | Add `htmlFor`/`id` + `aria-describedby` + `role="alert"` to CheckoutPage | `CheckoutPage.tsx` | S | — |
| FE-4 | Build `StationAutocomplete` component with typeahead + ARIA combobox pattern | New `StationAutocomplete.tsx`, `SearchPage.tsx` | L | — |
| FE-5 | Add `focus-visible` ring to BottomNav + all interactive elements; update Tailwind config | `BottomNav.tsx`, `tailwind.config.js`, all pages | M | — |
| FE-6 | Add `autocomplete` attributes + `inputmode="numeric"` to CheckoutPage inputs | `CheckoutPage.tsx` | S | — |
| FE-7 | Wrap CheckoutPage in `<form>`, change button to `type="submit"` | `CheckoutPage.tsx` | S | — |
| FE-8 | Add `<fieldset>/<legend>` to ticket type radio group in SearchPage | `SearchPage.tsx` | S | — |
| FE-9 | Add sort controls (Fastest/Cheapest/Greenest) to ResultsPage | `ResultsPage.tsx` | M | — |
| FE-10 | Expand JourneyCard to show inline leg detail with timeline view | `JourneyCard.tsx` | M | — |
| FE-11 | Add disruption banner to affected JourneyCards | `ResultsPage.tsx`, `JourneyCard.tsx` | M | BE-1 |
| FE-12 | Implement per-route `document.title` updates (custom hook) | New `usePageTitle.ts`, all page components | S | — |
| FE-13 | Add error summary box to SearchPage and CheckoutPage | `SearchPage.tsx`, `CheckoutPage.tsx` | M | FE-2, FE-3 |
| FE-14 | Add `aria-live` status region to ResultsPage and DepartureBoardPage | `ResultsPage.tsx`, `DepartureBoardPage.tsx` | S | — |
| FE-15 | Show booking reference on ConfirmationPage | `ConfirmationPage.tsx`, `JourneyContext.tsx` | S | — |
| FE-16 | Add CO₂ vs car comparison label to JourneyCard | `JourneyCard.tsx` | S | — |
| FE-17 | Implement recent searches in localStorage | New `recentSearches.ts`, `SearchPage.tsx` | M | — |
| FE-18 | Add "Now" shortcut button to date/time field | `SearchPage.tsx` | S | — |
| FE-19 | Platform badge always-visible on mobile in DepartureBoardPage | `DepartureBoardPage.tsx` | S | — |
| FE-20 | Passenger type selector on SearchPage | `SearchPage.tsx`, `types/index.ts` | L | BE-2 |

---

### `node-postgres-backend-dev`

| Task ID | Description | Files | Effort | Dependencies |
|---------|-------------|-------|:------:|:-------------|
| BE-1 | Add `getDisruptionsForRoute(from, to, operator)` method to IDisruptionsService and MockDisruptionsService | `transport.service.ts`, `mock/disruptions.mock.ts` | M | — |
| BE-2 | Extend `IJourneyService.searchJourneys` to accept passenger type; update mock pricing logic | `transport.service.ts`, `mock/journey.mock.ts`, `types/index.ts` | M | — |
| BE-3 | Add `getJourneyById(id)` method to service layer for direct ticket detail lookup | `transport.service.ts`, `mock/journey.mock.ts` | S | — |
| BE-4 | Add `TODO` stubs and interface definitions for real TfL/National Rail API integration points | `transport.service.ts` | M | — |
| BE-5 | Add intermediate stops to mock journey data and `JourneyLeg` type | `types/index.ts`, `data/journeys.ts`, `mock/journey.mock.ts` | M | — |

---

### `qa-engineer`

| Task ID | What to Test | Test Type | Acceptance Criteria |
|---------|-------------|:----------:|---------------------|
| QA-1 | Skip link behaviour: keyboard navigation reaches skip link first, activating it moves focus to `#main-content` | E2E (Playwright) | Focus lands on `#main-content` after skip link activation |
| QA-2 | Form label association: all inputs have accessible names via associated label | Accessibility audit (axe-core) | Zero label/input association violations |
| QA-3 | Error announcement: submitting SearchPage/CheckoutPage with errors announces error messages to screen reader | Accessibility + E2E | `role="alert"` present; `aria-describedby` links correct |
| QA-4 | Station autocomplete: typing 2+ chars shows filtered results; keyboard nav works; ARIA attributes correct | Unit + E2E | Combobox ARIA pattern passes axe audit; keyboard nav complete |
| QA-5 | Focus visibility: tabbing through entire app shows visible focus ring on every interactive element | E2E (visual) | No interactive element shows focus without visible ring |
| QA-6 | Results sorting: results re-order correctly for each sort option; ties handled consistently | Unit | Sorted order matches expected output for 5 journey fixtures |
| QA-7 | Disruption banner: banner appears when journey matches active disruption; absent when no match | Unit + Integration | Correct banner display for 3 fixture combinations |
| QA-8 | Page title updates: navigating between routes sets correct `document.title` | E2E | Each route title matches spec |
| QA-9 | Autocomplete attributes: browser autofill triggers on name/email fields in CheckoutPage | Manual + E2E | Chrome autofill populates fields correctly |

---

### `devops-infrastructure-engineer`

| Task ID | Description | What It Affects | Effort |
|---------|-------------|-----------------|:------:|
| DO-1 | Add `vite-plugin-pwa` and `manifest.json` for PWA support (P3-6) | `vite.config.ts`, `public/`, build pipeline | M |
| DO-2 | Add service worker with offline caching strategy for ticket wallet | New `sw.ts`, build config | L |
| DO-3 | Add `axe-core` automated accessibility CI check to pre-commit or CI pipeline | `scripts/`, CI config | M |
| DO-4 | Configure `<title>` SSR/pre-render for each route (if static hosting on Netlify/Vercel) | `vite.config.ts`, hosting config | M |
| DO-5 | Add Lighthouse CI to measure performance, accessibility, and PWA scores per PR | CI config | M |
| DO-6 | Add Content Security Policy headers appropriate for Leaflet/OSM tile loading | Hosting config (e.g. `_headers` for Netlify or response headers middleware) | S |

---

## Implementation Sequence (Suggested)

```
Sprint 1 — Accessibility Foundation (P1 items)
  FE-1  Skip link + main landmark
  FE-2  SearchPage label associations
  FE-3  CheckoutPage label + error associations
  FE-5  Focus-visible styles
  FE-6  Autocomplete attributes
  FE-7  Form element in Checkout
  FE-8  Fieldset/legend for radio group
  FE-12 Page titles
  QA-1 → QA-3, QA-5, QA-9 (accessibility tests)
  DO-3  Axe CI check

Sprint 2 — Core UX Improvements (P2 items)
  FE-4  Station autocomplete (highest ROI)
  FE-9  Results sorting
  FE-10 Journey leg detail inline
  FE-13 Error summary boxes
  FE-14 aria-live regions
  FE-15 Booking reference on confirmation
  BE-1  Disruption route matching
  FE-11 Disruption banner on results
  BE-5  Intermediate stops in mock data
  QA-4, QA-6, QA-7, QA-8

Sprint 3 — Differentiation & Polish (P3 items)
  FE-16 CO₂ vs car comparison
  FE-17 Recent searches
  FE-18 "Now" button
  FE-19 Platform badge mobile fix
  FE-20 Passenger type selector
  BE-2  Passenger type pricing
  DO-1/2 PWA + offline tickets
  DO-5  Lighthouse CI
  QA full regression
```

---

*Document version 1.0 — February 2026. Review and update when real API integrations are implemented or after user testing sessions.*
