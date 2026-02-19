import { useState, useEffect } from 'react';
import { AlertTriangle, Info, MapPin } from 'lucide-react';
import { getDisruptionsService } from '../../services/transport.service';
import PageShell from '../../components/layout/PageShell';
import { getSeverityColor, getSeverityBadge } from '../../utils/transport';
import type { Disruption, Severity } from '../../types';

const SEVERITIES: Array<'all' | Severity> = ['all', 'critical', 'high', 'medium', 'low'];

export default function ServiceUpdatesPage() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'all' | Severity>('all');

  useEffect(() => {
    getDisruptionsService().then(s => s.getDisruptions().then(setDisruptions));
  }, []);

  const filtered = disruptions.filter(d => {
    const matchesSev = severity === 'all' || d.severity === severity;
    const q = search.toLowerCase();
    const matchesSearch = !q || d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q) || d.operator.toLowerCase().includes(q);
    return matchesSev && matchesSearch;
  });

  const severityButtonClass = (sev: typeof SEVERITIES[0]) => {
    if (severity !== sev) return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    if (sev === 'all') return 'bg-brand text-white';
    if (sev === 'critical') return 'bg-red-500 text-white';
    if (sev === 'high') return 'bg-orange-500 text-white';
    if (sev === 'medium') return 'bg-yellow-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <PageShell>
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-brand" />
          <h1 className="text-3xl font-bold text-gray-900">Service Updates</h1>
        </div>

        <div className="space-y-4 mb-6">
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by location, operator, or service…"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-tint focus:border-transparent"
          />
          <div className="flex gap-2 flex-wrap">
            {SEVERITIES.map(sev => (
              <button key={sev} onClick={() => setSeverity(sev)}
                className={`px-4 py-2 rounded-lg font-medium transition ${severityButtonClass(sev)}`}>
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No disruptions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(d => (
              <div key={d.id} className={`border-2 rounded-lg p-5 ${getSeverityColor(d.severity)}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getSeverityBadge(d.severity)}`} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{d.title}</h3>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" />{d.location}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase px-3 py-1 rounded-full bg-white/50">
                        {d.severity}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{d.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{d.operator}</span>
                      <span className="text-gray-600">Updated {d.updated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
