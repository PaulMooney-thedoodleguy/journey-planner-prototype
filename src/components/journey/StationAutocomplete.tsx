import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MAP_STATIONS } from '../../data/stations';
import { getTransportIcon } from '../../utils/transport';

interface StationAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  errorId?: string;
  hasError?: boolean;
  inputClassName?: string;
}

/**
 * ARIA combobox with station typeahead.
 * Filters MAP_STATIONS from 2+ characters. Full keyboard support:
 * ArrowDown/Up to navigate, Enter to select, Escape to close.
 * Complies with ARIA 1.2 combobox pattern (WCAG 4.1.2).
 *
 * The listbox is rendered via a portal into document.body so it is never
 * clipped by overflow:hidden/auto scroll containers (e.g. BottomDrawer).
 */
export default function StationAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  errorId,
  hasError,
  inputClassName,
}: StationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const filtered = value.length >= 2
    ? MAP_STATIONS.filter(s => s.name.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  const shouldShowDropdown = isOpen && filtered.length > 0;
  const listboxId = `${id}-listbox`;

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
    onChange(name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
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
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={shouldShowDropdown ? listboxId : undefined}
          aria-activedescendant={highlightedIndex >= 0 ? `${id}-option-${highlightedIndex}` : undefined}
          aria-describedby={errorId}
          aria-invalid={hasError || undefined}
          className={inputClassName}
        />
      </div>

      {listbox}
    </div>
  );
}
