import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MAP_STATIONS } from '../../data/stations';
import { getTransportIcon } from '../../utils/transport';
import type { TransportMode } from '../../types';

const USE_REAL_API = import.meta.env.VITE_USE_MOCK_DATA === 'false';

interface StationOption {
  id: string | number;
  name: string;
  type: TransportMode;
}

interface StationAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** When provided, renders a Material Design floating label instead of relying on an external <label>. */
  label?: string;
  placeholder?: string;
  errorId?: string;
  hasError?: boolean;
  inputClassName?: string;
}

/**
 * ARIA combobox with station typeahead.
 * Mock mode: filters MAP_STATIONS synchronously from 2+ characters.
 * Real mode (VITE_USE_MOCK_DATA=false): calls TfL StopPoint Search API
 * with a 300 ms debounce.
 * Full keyboard support: ArrowDown/Up to navigate, Enter to select, Escape to close.
 * Complies with ARIA 1.2 combobox pattern (WCAG 4.1.2).
 *
 * The listbox is rendered via a portal into document.body so it is never
 * clipped by overflow:hidden/auto scroll containers (e.g. BottomDrawer).
 */
export default function StationAutocomplete({
  id,
  value,
  onChange,
  label,
  placeholder,
  errorId,
  hasError,
  inputClassName,
}: StationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [apiSuggestions, setApiSuggestions] = useState<StationOption[]>([]);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Prevents onFocus and the debounced API effect from reopening the dropdown
  // immediately after the user selects an option.
  const justSelectedRef = useRef(false);

  // In mock mode derive options synchronously; in real mode use debounced API state.
  const filtered: StationOption[] = USE_REAL_API
    ? apiSuggestions
    : value.length >= 2
      ? MAP_STATIONS
          .filter(s => s.name.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 8)
          .map(s => ({ id: s.id, name: s.name, type: s.type }))
      : [];

  const shouldShowDropdown = isOpen && filtered.length > 0;
  const listboxId = `${id}-listbox`;

  // Debounced TfL API search (real mode only).
  useEffect(() => {
    if (!USE_REAL_API) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setApiSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      try {
        const { searchStations } = await import('../../services/tfl/tfl-stop-search');
        const results = await searchStations(value);
        setApiSuggestions(results.map(r => ({ id: r.id, name: r.name, type: r.type })));
        setIsOpen(true);
      } catch {
        setApiSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Recompute fixed position whenever the dropdown opens or the window scrolls/resizes.
  useEffect(() => {
    if (!shouldShowDropdown || !wrapperRef.current) return;

    const updatePosition = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9900,
      });
    };

    updatePosition();
    // Capture-phase scroll catches scrolling inside the BottomDrawer.
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [shouldShowDropdown]);

  const selectStation = (name: string) => {
    justSelectedRef.current = true;
    // Cancel any pending debounced API search so it can't reopen the dropdown.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onChange(name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Derived floating state for the label (when label prop is used)
  const isFloating = isFocused || value.length > 0;

  // When label prop is used, derive border/input classes internally
  const labelledBorderClass = label
    ? hasError
      ? 'border-red-500'
      : isFocused
        ? 'border-brand'
        : 'border-gray-300'
    : undefined;
  const labelColorClass = label
    ? hasError
      ? 'text-red-500'
      : isFocused
        ? 'text-brand'
        : 'text-gray-500'
    : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (!USE_REAL_API) setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!shouldShowDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectStation(filtered[highlightedIndex].name);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Keep open if focus moves into the portal listbox (mouse hover / click).
    if (!listboxRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const listbox = shouldShowDropdown
    ? createPortal(
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label="Station suggestions"
          style={dropdownStyle}
          className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          {filtered.map((station, i) => {
            const isHighlighted = i === highlightedIndex;
            return (
              <li
                key={station.id}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={isHighlighted}
                onMouseDown={() => selectStation(station.name)}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 ${
                  isHighlighted ? 'bg-brand text-white' : 'hover:bg-brand-light'
                }`}
              >
                <span className={isHighlighted ? 'text-white' : 'text-brand'}>
                  {getTransportIcon(station.type)}
                </span>
                <span className="text-sm flex-1">{station.name}</span>
                <span className={`text-xs capitalize ${isHighlighted ? 'text-white/70' : 'text-gray-400'}`}>
                  {station.type}
                </span>
              </li>
            );
          })}
        </ul>,
        document.body,
      )
    : null;

  return (
    <div ref={wrapperRef} className="relative flex-1">
      {/* combobox wrapper exposes expanded state to assistive technology */}
      <div
        role="combobox"
        aria-expanded={shouldShowDropdown}
        aria-haspopup="listbox"
        aria-owns={shouldShowDropdown ? listboxId : undefined}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            if (justSelectedRef.current) {
              justSelectedRef.current = false;
              return;
            }
            if (value.length >= 2) setIsOpen(true);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={label ? undefined : placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={shouldShowDropdown ? listboxId : undefined}
          aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
          aria-describedby={errorId}
          aria-invalid={hasError || undefined}
          className={
            label
              ? `block w-full px-3 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-colors ${labelledBorderClass}`
              : inputClassName
          }
        />
      </div>

      {/* Floating label (Material Design outlined style) — only when label prop is provided */}
      {label && (
        <label
          htmlFor={id}
          className={`absolute left-2 z-10 px-1 bg-white pointer-events-none select-none origin-left transition-all duration-150 ${labelColorClass} ${
            isFloating
              ? '-top-2.5 translate-y-0 text-xs'
              : 'top-1/2 -translate-y-1/2 text-sm'
          }`}
        >
          {label}
        </label>
      )}

      {listbox}
    </div>
  );
}
