import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { PurchasedTicket } from '../types';

interface AppContextValue {
  purchasedTickets: PurchasedTicket[];
  addTickets: (tickets: PurchasedTicket[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);

  const addTickets = useCallback((tickets: PurchasedTicket[]) => {
    setPurchasedTickets(prev => [...prev, ...tickets]);
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
