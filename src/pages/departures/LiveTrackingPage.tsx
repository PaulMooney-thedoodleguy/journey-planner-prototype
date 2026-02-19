// This page has been consolidated into DeparturesPage (map-first single-page design).
// This file is a redirect fallback in case any deep link still points here directly.
import { Navigate, useParams } from 'react-router-dom';

export default function LiveTrackingPage() {
  const { stationId, serviceKey } = useParams<{ stationId: string; serviceKey: string }>();
  if (stationId && serviceKey) {
    return <Navigate to={`/departures/${stationId}/track/${serviceKey}`} replace />;
  }
  return <Navigate to="/departures" replace />;
}
