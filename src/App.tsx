import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { JourneyProvider } from './context/JourneyContext';
import { DeparturesProvider } from './context/DeparturesContext';
import BottomNav from './components/layout/BottomNav';
import TopNav from './components/layout/TopNav';
import UpdatePrompt from './components/layout/UpdatePrompt';

import SearchPage from './pages/home/SearchPage';
import ResultsPage from './pages/home/ResultsPage';
import CheckoutPage from './pages/home/CheckoutPage';
import ConfirmationPage from './pages/home/ConfirmationPage';
import TicketWalletPage from './pages/tickets/TicketWalletPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import DeparturesPage from './pages/departures/DeparturesPage';
import ServiceUpdatesPage from './pages/updates/ServiceUpdatesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <JourneyProvider>
          <DeparturesProvider>
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/tickets" element={<TicketWalletPage />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
              <Route path="/departures" element={<DeparturesPage />} />
              <Route path="/departures/:stationId" element={<DeparturesPage />} />
              <Route path="/departures/:stationId/track/:serviceKey" element={<DeparturesPage />} />
              <Route path="/updates" element={<ServiceUpdatesPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <TopNav />
            <BottomNav />
            <UpdatePrompt />
          </DeparturesProvider>
        </JourneyProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
