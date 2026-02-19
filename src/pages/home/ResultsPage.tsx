import { useNavigate } from 'react-router-dom';
import { useJourneyContext } from '../../context/JourneyContext';
import JourneyCard from '../../components/journey/JourneyCard';
import PageShell from '../../components/layout/PageShell';
import { getDurationMins } from '../../utils/transport';
import type { Journey } from '../../types';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { journeyResults, searchParams, setSelectedJourney } = useJourneyContext();

  // Guard against empty array — Math.min() with no args returns Infinity
  const lowestCO2 = journeyResults.length > 0 ? Math.min(...journeyResults.map(j => j.co2)) : null;
  const lowestPrice = journeyResults.length > 0 ? Math.min(...journeyResults.map(j => j.price[searchParams.ticketType])) : null;
  const shortestDuration = journeyResults.length > 0 ? Math.min(...journeyResults.map(j => getDurationMins(j.duration))) : null;

  const handleSelect = (journey: Journey) => {
    setSelectedJourney(journey);
    navigate('/checkout');
  };

  // Parse date as local time (append T00:00 to avoid UTC → local day shift)
  const displayDate = searchParams.date
    ? new Date(searchParams.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <PageShell>
      <button onClick={() => navigate('/')} className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2">
        ← Back to Search
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Available Journeys</h2>
          {journeyResults.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">Eco-friendly options highlighted</span>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          {searchParams.from} → {searchParams.to} • {displayDate}
        </p>

        {journeyResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No journeys found</p>
            <p className="text-sm mb-6">Try adjusting your search or selecting a different date.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Back to Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {journeyResults.map(j => (
              <JourneyCard
                key={j.id}
                journey={j}
                ticketType={searchParams.ticketType}
                isGreenest={j.co2 === lowestCO2}
                isFastest={getDurationMins(j.duration) === shortestDuration}
                isCheapest={j.price[searchParams.ticketType] === lowestPrice}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
