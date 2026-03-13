/**
 * Material Design "outlined select" — always-floating label variant.
 * Select always shows a value so the label never sits in the center of the field.
 */
import { useState } from 'react';

interface OutlinedSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export default function OutlinedSelect({
  id,
  label,
  value,
  onChange,
  children,
}: OutlinedSelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderClass = isFocused ? 'border-brand' : 'border-gray-300';
  const labelColorClass = isFocused ? 'text-brand' : 'text-gray-500';

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`block w-full px-3 py-3.5 border-2 rounded-lg bg-white focus:outline-none transition-colors appearance-none pr-9 ${borderClass}`}
      >
        {children}
      </select>
      {/* Always-floating label */}
      <label
        htmlFor={id}
        className={`absolute left-2 z-10 -top-2.5 translate-y-0 text-xs px-1 bg-white pointer-events-none select-none transition-colors ${labelColorClass}`}
      >
        {label}
      </label>
      {/* Chevron */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" aria-hidden="true">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
