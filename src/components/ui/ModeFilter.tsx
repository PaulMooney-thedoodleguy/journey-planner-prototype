/**
 * Reusable transport mode filter pills.
 * Renders an "All" toggle followed by one pill per available mode.
 * "All" activates when every mode is selected.
 * Prevents the last active mode from being deselected.
 */
import type { TransportMode } from '../../types';
import { getTransportIcon, getModeHex } from '../../utils/transport';

interface ModeFilterProps {
  availableModes: TransportMode[];
  activeModes: Set<TransportMode>;
  onChange: (modes: Set<TransportMode>) => void;
}

export default function ModeFilter({ availableModes, activeModes, onChange }: ModeFilterProps) {
  const allActive = availableModes.every(m => activeModes.has(m));

  const handleAll = () => {
    if (!allActive) onChange(new Set(availableModes));
  };

  const handleToggle = (mode: TransportMode) => {
    const next = new Set(activeModes);
    if (next.has(mode)) {
      if (next.size > 1) next.delete(mode);
    } else {
      next.add(mode);
    }
    onChange(next);
  };

  return (
    <div role="group" aria-label="Filter by transport mode" className="flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleAll}
        aria-pressed={allActive}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
          allActive
            ? 'bg-brand text-white border-brand'
            : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
        }`}
      >
        All
      </button>

      {availableModes.map(mode => {
        const active = activeModes.has(mode);
        const hex = getModeHex(mode);
        return (
          <button
            key={mode}
            type="button"
            onClick={() => handleToggle(mode)}
            aria-pressed={active}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border"
            style={
              active
                ? { backgroundColor: hex, borderColor: hex, color: 'white' }
                : { backgroundColor: 'white', borderColor: '#d1d5db', color: '#6b7280' }
            }
          >
            <span className="w-3.5 h-3.5 flex items-center justify-center" aria-hidden="true">
              {getTransportIcon(mode)}
            </span>
            <span className="capitalize">{mode}</span>
          </button>
        );
      })}
    </div>
  );
}
