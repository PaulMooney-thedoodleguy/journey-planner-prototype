import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <PageShell centered>
      <div className="text-center p-8">
        <p className="text-6xl font-bold text-brand-light mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition"
        >
          Back to Planner
        </button>
      </div>
    </PageShell>
  );
}
