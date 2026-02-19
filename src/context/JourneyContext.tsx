import { createContext, useContext, useState, ReactNode } from 'react';
import type { Journey, JourneySearchParams, TicketType, PurchasedTicket, PassengerDetails } from '../types';
import { getJourneyService } from '../services/transport.service';
import { generateReference } from '../utils/formatting';
import { useAppContext } from './AppContext';

interface JourneyContextValue {
  searchParams: JourneySearchParams;
  setSearchParams: (params: JourneySearchParams) => void;
  journeyResults: Journey[];
  isSearching: boolean;
  searchError: string | null;
  selectedJourney: Journey | null;
  setSelectedJourney: (j: Journey | null) => void;
  passengerDetails: PassengerDetails;
  setPassengerDetails: (d: PassengerDetails) => void;
  lastBookingRef: string | null;
  submitSearch: (params: JourneySearchParams) => Promise<boolean>;
  completePayment: (ticketType: TicketType) => PurchasedTicket[];
  resetJourney: () => void;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const { addTickets } = useAppContext();

  const [searchParams, setSearchParams] = useState<JourneySearchParams>({
    from: 'Current Location',
    to: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    ticketType: 'single',
    passengerType: 'adult',
  });
  const [journeyResults, setJourneyResults] = useState<Journey[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [passengerDetails, setPassengerDetails] = useState<PassengerDetails>({
    name: '', email: '',
  });
  const [lastBookingRef, setLastBookingRef] = useState<string | null>(null);

  const submitSearch = async (params: JourneySearchParams): Promise<boolean> => {
    setIsSearching(true);
    setSearchError(null);
    try {
      const service = await getJourneyService();
      const results = await service.searchJourneys(params);
      setJourneyResults(results);
      setSearchParams(params);
      return true;
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to search journeys. Please try again.');
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const completePayment = (ticketType: TicketType): PurchasedTicket[] => {
    if (!selectedJourney) return [];
    const date = searchParams.date;
    let tickets: PurchasedTicket[];

    if (selectedJourney.requiresMultipleTickets && selectedJourney.tickets) {
      const groupId = Date.now();
      tickets = selectedJourney.tickets.map((t, idx) => ({
        id: crypto.randomUUID(),
        reference: generateReference(),
        journey: selectedJourney,
        passenger: passengerDetails.name,
        email: passengerDetails.email,
        date, ticketType,
        price: t.price,
        operator: t.operator,
        operatorColor: t.color,
        operatorLogo: t.logo,
        services: t.services,
        isPartOfMultiModal: true,
        multiModalGroup: groupId,
        ticketNumber: idx + 1,
        totalTickets: selectedJourney.tickets!.length,
      }));
    } else {
      tickets = [{
        id: crypto.randomUUID(),
        reference: generateReference(),
        journey: selectedJourney,
        passenger: passengerDetails.name,
        email: passengerDetails.email,
        date, ticketType,
        price: selectedJourney.price[ticketType],
      }];
    }

    addTickets(tickets);
    setLastBookingRef(tickets[0].reference);
    return tickets;
  };

  const resetJourney = () => {
    setSearchParams(prev => ({ ...prev, to: '' }));
    setSelectedJourney(null);
    setPassengerDetails({ name: '', email: '' });
    setLastBookingRef(null);
  };

  return (
    <JourneyContext.Provider value={{
      searchParams, setSearchParams,
      journeyResults, isSearching, searchError,
      selectedJourney, setSelectedJourney,
      passengerDetails, setPassengerDetails,
      lastBookingRef,
      submitSearch, completePayment, resetJourney,
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourneyContext(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourneyContext must be used within JourneyProvider');
  return ctx;
}
