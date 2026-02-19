// This page has been consolidated into DeparturesPage (map-first single-page design).
// This file is a redirect fallback in case any deep link still points here directly.
import { Navigate, useParams } from 'react-router-dom';

export default function DepartureBoardPage() {
  const { stationId } = useParams<{ stationId: string }>();
  return <Navigate to={stationId ? `/departures/${stationId}` : '/departures'} replace />;
}
