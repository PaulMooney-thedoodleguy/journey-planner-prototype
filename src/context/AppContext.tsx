import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PurchasedTicket } from '../types';
import { loadTickets, saveTickets } from '../utils/ticketStorage';

interface AppContextValue {
  purchasedTickets: PurchasedTicket[];
  addTickets: (tickets: PurchasedTicket[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>(loadTickets);

  const addTickets = useCallback((tickets: PurchasedTicket[]) => {
    setPurchasedTickets(prev => {
      const updated = [...prev, ...tickets];
      saveTickets(updated);
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{ purchasedTickets, addTickets }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
