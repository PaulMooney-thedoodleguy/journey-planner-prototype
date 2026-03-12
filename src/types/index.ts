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
  id: number;
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
}

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  type: TransportMode;
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
}

// ─── Map (shared contract for stub and real Google Maps) ─────

export interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  type: TransportMode;
  label?: string;
}

export interface MapViewProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routePolyline?: { lat: number; lng: number }[];
  vehicleMarker?: { lat: number; lng: number; direction?: number };
  onMarkerClick?: (id: string | number) => void;
  height?: string;
}

// ─── Passenger form ───────────────────────────────────────────

export interface PassengerDetails {
  name: string;
  email: string;
}
