/**
 * Material Design "outlined text field" (Style 2).
 * Label lives inside the field and floats up to the border line on focus or when
 * the field has a value. Handles text / email / password / date / time variants.
 */
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface OutlinedFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'date' | 'time';
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  /** ID of an external error <p> element for aria-describedby */
  errorId?: string;
  hasError?: boolean;
  /** Forward a ref to the underlying <input> (e.g. for focus management) */
  fieldRef?: React.RefObject<HTMLInputElement>;
}

export default function OutlinedField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  maxLength,
  inputMode,
  errorId,
  hasError,
  fieldRef,
}: OutlinedFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Date / time inputs always show browser chrome — keep label floating always.
  const alwaysFloat = type === 'date' || type === 'time';
  const isFloating = alwaysFloat || isFocused || value.length > 0;

  const actualType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const borderClass = hasError
    ? 'border-red-500'
    : isFocused
      ? 'border-brand'
      : 'border-gray-300';

  const labelColorClass = hasError
    ? 'text-red-500'
    : isFocused
      ? 'text-brand'
      : isFloating
        ? 'text-gray-500'
        : 'text-gray-400';

  return (
    <div className="relative">
      <input
        ref={fieldRef}
        id={id}
        type={actualType}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-describedby={errorId}
        aria-invalid={hasError || undefined}
        className={`block w-full px-3 py-3.5 border-2 rounded-lg bg-transparent focus:outline-none transition-colors ${borderClass} ${type === 'password' ? 'pr-12' : ''}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-2 px-1 bg-white pointer-events-none select-none origin-left transition-all duration-150 ${labelColorClass} ${
          isFloating
            ? '-top-2.5 translate-y-0 text-xs'
            : 'top-1/2 -translate-y-1/2 text-sm'
        }`}
      >
        {label}
      </label>
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
        >
          {showPassword
            ? <EyeOff className="w-5 h-5" aria-hidden="true" />
            : <Eye className="w-5 h-5" aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
