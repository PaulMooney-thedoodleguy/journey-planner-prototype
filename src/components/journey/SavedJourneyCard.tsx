import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, MoreVertical } from 'lucide-react';
import type { SavedJourney } from '../../types';
import { getTransportIcon, getModeHex } from '../../utils/transport';
import { formatDate } from '../../utils/formatting';

interface Props {
  savedJourney: SavedJourney;
  hasTicket: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export default function SavedJourneyCard({
  savedJourney,
  hasTicket,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const mode = savedJourney.type ?? 'train';
  const modeHex = getModeHex(mode);

  const handleMenuBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Close menu only if focus moves outside the menu container
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setMenuOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setMenuOpen(false);
  };

  const handleDeleteClick = () => {
    setMenuOpen(false);
    if (hasTicket) {
      setConfirmDelete(true);
    } else {
      onDelete();
    }
  };

  if (confirmDelete) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-900 mb-1">Remove saved journey?</p>
        <p className="text-xs text-amber-800 mb-3">
          This journey is linked to a purchased ticket. Removing it from My Journeys won't affect your ticket, which remains in your Tickets wallet.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="flex-1 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 py-2 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Delete anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
      {/* Clickable area — navigates to journey plan */}
      <button
        type="button"
        onClick={() => navigate(`/journeys/${savedJourney.id}`)}
        className="flex flex-1 items-center gap-3 text-left min-w-0"
        aria-label={`View journey plan: ${savedJourney.from} to ${savedJourney.to}`}
      >
        {/* Mode icon */}
        <div
          className="rounded-xl flex items-center justify-center w-9 h-9 shrink-0"
          style={{ backgroundColor: 'white', border: `2px solid ${modeHex}`, color: modeHex }}
          aria-hidden="true"
        >
          {getTransportIcon(mode, 'w-5 h-5')}
        </div>

        {/* Journey info */}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {savedJourney.from} → {savedJourney.to}
          </p>
          <p className="text-xs text-gray-500">
            {savedJourney.date ? formatDate(savedJourney.date) : ''}
            {savedJourney.departure ? ` · ${savedJourney.departure}` : ''}
          </p>
        </div>
      </button>

      {/* Ticket badge */}
      {hasTicket && (
        <Ticket className="w-4 h-4 text-brand shrink-0" aria-label="Has linked ticket" />
      )}

      {/* 3-dot menu */}
      <div
        ref={menuRef}
        className="relative shrink-0"
        onBlur={handleMenuBlur}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Journey options"
          title="Journey options"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-10 py-1"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onMoveUp(); }}
              disabled={isFirst}
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 ${isFirst ? 'opacity-40 cursor-not-allowed' : 'text-gray-700'}`}
            >
              Move up
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onMoveDown(); }}
              disabled={isLast}
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 ${isLast ? 'opacity-40 cursor-not-allowed' : 'text-gray-700'}`}
            >
              Move down
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              type="button"
              role="menuitem"
              onClick={handleDeleteClick}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
