import { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

function ordinal(n: number): string {
  const v = n % 100;
  return n + (['th', 'st', 'nd', 'rd'][(v - 20) % 10] ?? ['th', 'st', 'nd', 'rd'][v] ?? 'th');
}
import type { RouteTimetable, TransportMode } from '../../types';
import { getModeHex, getTransportIcon } from '../../utils/transport';

interface Props {
  timetable: RouteTimetable;
  operator: string;
  destination: string;
  stationType: TransportMode;
  boardingStopName?: string;
  onBack: () => void;
}

// Format YYYY-MM-DD from a local Date (avoids UTC-offset bugs with toISOString)
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateLabel(date: Date, today: Date): string {
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const month   = date.toLocaleDateString('en-GB', { month: 'long' });
  const year    = date.getFullYear();
  const label   = `${weekday} ${ordinal(date.getDate())} ${month}`;
  return year !== today.getFullYear() ? `${label} ${year}` : label;
}

export default function TimetablePanel({
  timetable,
  operator,
  destination,
  stationType,
  boardingStopName,
  onBack,
}: Props) {
  const [activeTab, setActiveTab]       = useState<'service' | 'all'>('service');
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const scrollRef      = useRef<HTMLDivElement>(null);
  const selectedColRef = useRef<HTMLTableCellElement>(null);
  const dateInputRef   = useRef<HTMLInputElement>(null);

  const hex = getModeHex(stationType);
  const { stops, departureTimes, selectedServiceIndex } = timetable;

  // Stable reference to "today at midnight" — computed once on mount
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Last day with available timetable data (6 months ahead)
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 6);
    return d;
  }, [today]);

  const isAtMin = toLocalDateStr(selectedDate) <= toLocalDateStr(today);
  const isAtMax = toLocalDateStr(selectedDate) >= toLocalDateStr(maxDate);

  const prevDay = () => setSelectedDate(prev => {
    const d = new Date(prev); d.setDate(d.getDate() - 1); return d;
  });
  const nextDay = () => setSelectedDate(prev => {
    const d = new Date(prev); d.setDate(d.getDate() + 1); return d;
  });

  // Scroll selected column into view when the "All services" tab opens
  useEffect(() => {
    if (activeTab === 'all' && scrollRef.current && selectedColRef.current) {
      const container   = scrollRef.current;
      const cell        = selectedColRef.current;
      const scrollTarget = cell.offsetLeft - container.clientWidth / 2 + cell.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
    }
  }, [activeTab]);

  // ── Shared timetable helpers ───────────────────────────────────────────────

  const ROW_H = 'h-9'; // 36 px — kept in sync between left column and right table

  const rowBg = (idx: number, isBoarding: boolean) =>
    isBoarding ? `${hex}1a` : idx % 2 === 0 ? '#ffffff' : '#f9fafb';

  const isStopBoarding = (name: string) =>
    boardingStopName
      ? name.toLowerCase().includes(boardingStopName.toLowerCase()) ||
        boardingStopName.toLowerCase().includes(name.toLowerCase())
      : false;

  // ── "This service" tab ─────────────────────────────────────────────────────
  const ServiceTab = () => (
    <div className="space-y-0">
      {stops.map((stop, idx) => {
        const time       = stop.times[selectedServiceIndex] ?? null;
        const isLast     = idx === stops.length - 1;
        const isBoarding = isStopBoarding(stop.name);

        return (
          <div key={idx} className="flex items-stretch gap-3">

            {/* Spine + dot */}
            <div className="flex flex-col items-center w-5 shrink-0">
              <div
                className="w-3 h-3 rounded-full border-2 mt-1 shrink-0"
                style={{
                  backgroundColor: isBoarding ? hex : 'white',
                  borderColor: isBoarding ? hex : '#d1d5db',
                }}
              />
              {!isLast && <div className="w-px flex-1 my-0.5 bg-gray-200" />}
            </div>

            {/* Stop name + time */}
            <div className="flex-1 pb-3 flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <span
                  className={`text-sm ${isBoarding ? 'font-semibold' : 'text-gray-700'}`}
                  style={isBoarding ? { color: hex } : undefined}
                >
                  {stop.name}
                </span>
                {isBoarding && (
                  <span
                    className="ml-2 inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border"
                    style={{ color: hex, backgroundColor: `${hex}15`, borderColor: hex }}
                  >
                    Board here
                  </span>
                )}
              </div>
              {time && (
                <span
                  className={`text-sm tabular-nums shrink-0 ${isBoarding ? 'font-bold' : 'text-gray-500'}`}
                  style={isBoarding ? { color: hex } : undefined}
                >
                  {time}
                </span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );

  // ── "All services" tab ─────────────────────────────────────────────────────
  // The stop-name column is a plain <div> OUTSIDE the scroll container —
  // scrolling content is physically bounded by the scroll container's edge
  // and can never visually overlap the stop names.
  const AllServicesTab = () => (
    <>
      {/* ── Date navigation bar ── */}
      <div className="mb-1">
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-1 py-1">

          {/* Previous day */}
          <button
            onClick={prevDay}
            disabled={isAtMin}
            aria-label="Previous day"
            className="p-1.5 rounded-lg text-gray-600 transition hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Date display — tapping opens the native date picker via showPicker() */}
          <button
            type="button"
            onClick={() => {
              const input = dateInputRef.current;
              if (!input) return;
              if (typeof (input as HTMLInputElement & { showPicker?: () => void }).showPicker === 'function') {
                (input as HTMLInputElement & { showPicker: () => void }).showPicker();
              } else {
                input.click();
              }
            }}
            className="flex-1 flex flex-col items-center gap-0.5 py-0.5 rounded-lg hover:bg-gray-200 transition"
            aria-label={`Viewing timetable for ${formatDateLabel(selectedDate, today)}. Tap to choose a different date`}
          >
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {formatDateLabel(selectedDate, today)}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <CalendarDays className="w-3 h-3" aria-hidden="true" />
              Tap to select date
            </span>
          </button>

          {/* Hidden date input — opened programmatically via showPicker() */}
          <input
            ref={dateInputRef}
            type="date"
            value={toLocalDateStr(selectedDate)}
            min={toLocalDateStr(today)}
            max={toLocalDateStr(maxDate)}
            onChange={e => {
              if (e.target.value) {
                const [y, mo, d] = e.target.value.split('-').map(Number);
                setSelectedDate(new Date(y, mo - 1, d));
              }
            }}
            aria-hidden="true"
            tabIndex={-1}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />

          {/* Next day */}
          <button
            onClick={nextDay}
            disabled={isAtMax}
            aria-label="Next day"
            className="p-1.5 rounded-lg text-gray-600 transition hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>

        </div>

        {/* Boundary affordance */}
        {isAtMax ? (
          <p className="text-xs text-center text-amber-600 mt-1.5 px-1">
            Last available date — timetable data covers the next 6 months
          </p>
        ) : (
          <p className="text-xs text-center text-gray-400 mt-1.5 px-1">
            Available until {maxDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* ── Timetable grid ── */}
      <div className="-mx-4 sm:-mx-6 flex mt-3">

        {/* Left: fixed stop-name column */}
        <div className="shrink-0 w-[140px] border-r border-gray-200">
          <div className={`${ROW_H} flex items-center px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200`}>
            Stop
          </div>
          {stops.map((stop, idx) => {
            const boarding = isStopBoarding(stop.name);
            return (
              <div
                key={idx}
                className={`${ROW_H} flex items-center gap-1.5 px-3 text-xs font-medium overflow-hidden`}
                style={{ backgroundColor: rowBg(idx, boarding), color: boarding ? hex : '#111827' }}
              >
                {boarding && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: hex }} aria-hidden="true" />
                )}
                <span className="truncate">{stop.name}</span>
              </div>
            );
          })}
        </div>

        {/* Right: scrollable time grid */}
        <div ref={scrollRef} className="overflow-x-auto flex-1">
          <table className="border-separate border-spacing-0 text-xs w-full">
            <thead>
              <tr>
                {departureTimes.map((_, svcIdx) => {
                  const isSelected = svcIdx === selectedServiceIndex;
                  return (
                    <th
                      key={svcIdx}
                      ref={isSelected ? selectedColRef : undefined}
                      className={`${ROW_H} border-b min-w-[62px]`}
                      style={isSelected
                        ? { backgroundColor: `${hex}12`, borderBottomColor: hex, borderBottomWidth: 2 }
                        : { borderBottomColor: '#e5e7eb' }}
                    />
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {stops.map((stop, stopIdx) => {
                const boarding = isStopBoarding(stop.name);
                return (
                  <tr key={stopIdx}>
                    {stop.times.map((t, svcIdx) => {
                      const isSelected = svcIdx === selectedServiceIndex;
                      return (
                        <td
                          key={svcIdx}
                          className={`${ROW_H} px-3 text-center tabular-nums`}
                          style={isSelected
                            ? { backgroundColor: `${hex}12`, color: hex, fontWeight: 600 }
                            : { backgroundColor: rowBg(stopIdx, boarding), color: '#374151' }}
                        >
                          {t ?? '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 sm:px-6 pb-6">

      {/* Top bar */}
      <div className="flex items-center gap-3 pt-3 pb-4">
        <button
          onClick={onBack}
          className="shrink-0 text-brand hover:text-brand-hover font-medium text-sm transition-colors"
          aria-label="Back to service info"
        >
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate">
            {operator} · {destination}
          </p>
          <p className="text-xs text-gray-400">Timetable</p>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'white', border: `2px solid ${hex}`, color: hex }}
          aria-hidden="true"
        >
          {getTransportIcon(stationType, 'w-4 h-4')}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'service'}
          onClick={() => setActiveTab('service')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'service'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          This service
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'all'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          All services
        </button>
      </div>

      {/* Tab panels */}
      {activeTab === 'service' ? <ServiceTab /> : <AllServicesTab />}

    </div>
  );
}
