import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Station, Departure } from '../types';
import { getDeparturesService } from '../services/transport.service';

interface DeparturesContextValue {
  nearbyStations: Station[];
  selectedStation: Station | null;
  setSelectedStation: (s: Station | null) => Promise<void>;
  departures: Departure[];
  isDeparturesLoading: boolean;
  trackedService: Departure | null;
  setTrackedService: (d: Departure | null) => void;
}

const DeparturesContext = createContext<DeparturesContextValue | null>(null);

export function DeparturesProvider({ children }: { children: ReactNode }) {
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStationState] = useState<Station | null>(null);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [isDeparturesLoading, setIsDeparturesLoading] = useState(false);
  const [trackedService, setTrackedService] = useState<Departure | null>(null);

  useEffect(() => {
    getDeparturesService()
      .then(s => s.getNearbyStations())
      .then(setNearbyStations)
      .catch(err => console.error('Failed to load nearby stations:', err));
  }, []);

  const setSelectedStation = async (station: Station | null) => {
    setSelectedStationState(station);
    setTrackedService(null);
    setDepartures([]);
    if (station) {
      setIsDeparturesLoading(true);
      try {
        const service = await getDeparturesService();
        const deps = await service.getDepartures(station.id);
        setDepartures(deps);
      } finally {
        setIsDeparturesLoading(false);
      }
    }
  };

  return (
    <DeparturesContext.Provider value={{
      nearbyStations, selectedStation, setSelectedStation,
      departures, isDeparturesLoading,
      trackedService, setTrackedService,
    }}>
      {children}
    </DeparturesContext.Provider>
  );
}

export function useDeparturesContext(): DeparturesContextValue {
  const ctx = useContext(DeparturesContext);
  if (!ctx) throw new Error('useDeparturesContext must be used within DeparturesProvider');
  return ctx;
}
