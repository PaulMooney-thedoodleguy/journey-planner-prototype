import type { MapViewProps } from '../../types';
import MapStub from './MapStub';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const hasRealKey = !!MAPS_API_KEY && MAPS_API_KEY !== 'REPLACE_ME';

/**
 * MapView is the single integration point for Google Maps.
 * All pages import this component — never MapStub directly.
 *
 * To activate real Google Maps:
 *   1. Set VITE_GOOGLE_MAPS_API_KEY in .env to your real key
 *   2. npm install @react-google-maps/api
 *   3. Replace the stub branch below with the real implementation
 */
export default function MapView(props: MapViewProps) {
  if (!hasRealKey) {
    return <MapStub {...props} />;
  }

  // TODO: Real Google Maps implementation
  // import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
  return <MapStub {...props} />;
}
