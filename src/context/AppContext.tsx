import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PurchasedTicket, SavedJourney } from '../types';
import { loadTickets, saveTickets } from '../utils/ticketStorage';
import { loadSavedJourneys, saveSavedJourneys } from '../utils/savedJourneyStorage';

interface AppContextValue {
  purchasedTickets: PurchasedTicket[];
  addTickets: (tickets: PurchasedTicket[]) => void;
  savedJourneys: SavedJourney[];
  addSavedJourney: (j: SavedJourney) => void;
  removeSavedJourney: (id: string) => void;
  reorderSavedJourney: (id: string, direction: 'up' | 'down') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>(loadTickets);
  const [savedJourneys, setSavedJourneys] = useState<SavedJourney[]>(loadSavedJourneys);

  const addTickets = useCallback((tickets: PurchasedTicket[]) => {
    setPurchasedTickets(prev => {
      const updated = [...prev, ...tickets];
      saveTickets(updated);
      return updated;
    });
  }, []);

  const addSavedJourney = useCallback((j: SavedJourney) => {
    setSavedJourneys(prev => {
      // Deduplicate: skip if same journeyData.id + date already exists
      const duplicate = prev.find(
        existing =>
          existing.journeyData?.id === j.journeyData?.id &&
          existing.date === j.date
      );
      if (duplicate) return prev;
      const updated = [...prev, j];
      saveSavedJourneys(updated);
      return updated;
    });
  }, []);

  const removeSavedJourney = useCallback((id: string) => {
    setSavedJourneys(prev => {
      const updated = prev.filter(sj => sj.id !== id);
      saveSavedJourneys(updated);
      return updated;
    });
  }, []);

  const reorderSavedJourney = useCallback((id: string, direction: 'up' | 'down') => {
    setSavedJourneys(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(sj => sj.id === id);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      // Swap order values
      const updated = sorted.map(sj => ({ ...sj }));
      const tmpOrder = updated[idx].order;
      updated[idx].order = updated[swapIdx].order;
      updated[swapIdx].order = tmpOrder;
      saveSavedJourneys(updated);
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      purchasedTickets, addTickets,
      savedJourneys, addSavedJourney, removeSavedJourney, reorderSavedJourney,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
