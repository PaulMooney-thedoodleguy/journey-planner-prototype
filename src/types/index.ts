export type TransportMode = 'train' | 'bus' | 'tube' | 'tram' | 'ferry' | 'walk' | 'cycle' | 'multimodal';
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type TicketType = 'single' | 'return';
export type PassengerType = 'adult' | 'child' | 'railcard';

// ─── Journey ─────────────────────────────────────────────────

export interface JourneyLeg {
  mode: TransportMode;
  operator: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  platform?: string;
  stops?: number;
  intermediateStops?: string[];
  /** Coordinates populated by real API — used for route polyline when station
   *  names don't match the hardcoded ROUTE_STATION_COORDS lookup table. */
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}

export interface OperatorTicket {
  id: number;
  operator: string;
  color: string;
  logo: string;
  services: string[];
  price: number;
}

export interface Journey {
  id: number;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  changes: number;
  type: TransportMode;
  operator: string;
  price: Record<TicketType, number>;
  co2: number;
  carCo2?: number;
  legs?: JourneyLeg[];
  requiresMultipleTickets?: boolean;
  tickets?: OperatorTicket[];
}

export interface JourneySearchParams {
  from: string;
  to: string;
  via?: string;
  date: string;
  time: string;
  ticketType: TicketType;
  passengerType: PassengerType;
}

// ─── Tickets ─────────────────────────────────────────────────

export interface PurchasedTicket {
  id: string;
  reference: string;
  journey: Journey;
  passenger: string;
  email: string;
  date: string;
  ticketType: TicketType;
  price: number;
  operator?: string;
  operatorColor?: string;
  operatorLogo?: string;
  services?: string[];
  isPartOfMultiModal?: boolean;
  multiModalGroup?: number;
  ticketNumber?: number;
  totalTickets?: number;
}

export interface SavedJourney {
  id: string;
  from: string;
  to: string;
  date?: string;           // ISO date "YYYY-MM-DD"
  departure?: string;      // "HH:MM"
  arrival?: string;        // "HH:MM"
  duration?: string;       // "2h 15m"
  type?: TransportMode;
  operator?: string;
  changes?: number;
  order: number;           // user-defined sort position; use Date.now() on creation
  savedAt: string;         // ISO timestamp
  ticketId?: string;       // single-ticket linkage (non-multimodal)
  ticketGroupId?: number;  // multimodal group linkage
  journeyData?: Journey;   // full Journey object for the plan page
}

// ─── Stations & departures ────────────────────────────────────

export interface Station {
  id: string | number;
  name: string;
  type: TransportMode;
  distance?: string;
  lat?: number;
  lng?: number;
}

export interface Departure {
  time: string;
  destination: string;
  platform: string | null;
  operator: string;
  status: string;
  hasLiveTracking: boolean;
  vehiclePosition?: { lat: number; lng: number };
  direction?: string;
  /** TfL machine-readable line ID (e.g. "central", "73"). Present in real mode only. */
  lineId?: string;
}

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  type: TransportMode;
}

export interface TimetableStop {
  name: string;
  times: (string | null)[]; // one per service; null = service doesn't call here
}

export interface RouteTimetable {
  stopNames: string[];
  departureTimes: string[];    // departure time from first stop for each service
  stops: TimetableStop[];       // rows in the grid
  selectedServiceIndex: number; // column to highlight
}

// ─── Disruptions ─────────────────────────────────────────────

export interface Disruption {
  id: number;
  severity: Severity;
  title: string;
  location: string;
  description: string;
  operator: string;
  updated: string;
  lat?: number;
  lng?: number;
  mode?: TransportMode;
  affectedRoute?: { lat: number; lng: number }[];
  affectedStops?: { name: string; lat: number; lng: number }[];
  affectedRadius?: number;
}

// ─── Map (shared contract for stub and real Google Maps) ─────

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  type: TransportMode;
  label?: string;
  color?: string;
}

export interface MapPolyline {
  id: string | number;
  points: { lat: number; lng: number }[];
  color: string;
  weight?: number;
  dashed?: boolean;
}

export interface MapCircle {
  id: string | number;
  lat: number;
  lng: number;
  radius: number;
  color: string;
}

export interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  /** When provided, the map filter always shows exactly these modes (instead of
   *  deriving the list from whatever marker types happen to be present). */
  filterModes?: TransportMode[];
  /** Controlled active-mode state — when provided, map filter reads/writes this
   *  instead of maintaining its own internal state. Use together with onModeChange
   *  to keep the map filter in sync with an external panel filter. */
  activeModes?: Set<TransportMode>;
  onModeChange?: (modes: Set<TransportMode>) => void;
  routePolyline?: { lat: number; lng: number }[];
  polylines?: MapPolyline[];
  circles?: MapCircle[];
  vehicleMarker?: { lat: number; lng: number; direction?: number };
  onMarkerClick?: (id: string | number) => void;
  /** Called when the user clicks "Set as destination" inside a stop popup. */
  onSetDestination?: (name: string) => void;
  /** Called when the user clicks "View departures" inside a stop popup.
   *  name and type are the stop's display label and transport mode — always
   *  provided so callers can construct a Station even for stops not in any
   *  local JSON lookup (e.g. bus stops from bus-stops.json). */
  onViewDepartures?: (id: string | number, name?: string, type?: TransportMode) => void;
  /** Called on map moveend with the new centre coordinates. */
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  /** When false, marker popups are suppressed and clicks fire callbacks directly.
   *  Defaults to true. Set false on the Departures map. */
  showPopups?: boolean;
  height?: string;
  /** When true (default), renders the static UK bus stop layer with viewport culling. */
  showBusStops?: boolean;
}

// ─── Passenger form ───────────────────────────────────────────

export interface PassengerDetails {
  name: string;
  email: string;
}

// ─── User account ─────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  homeStation?: string;
  defaultRailcard?: 'none' | '16-25' | 'network' | 'senior';
}
