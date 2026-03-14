import { useEffect, useRef } from 'react';
import { MdTrain } from 'react-icons/md';

interface Props {
  onComplete: () => void;
}

const TEAL = '#54BF8A';
const TEAL_LIGHT = '#54BF8A22';
const GRAY_TRACK = '#e5e7eb';
const DURATION = 1.85; // seconds — total animation duration before onComplete fires at 2s

export default function PaymentProcessingOverlay({ onComplete }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Move focus into the dialog on mount (WCAG 2.4.3)
  useEffect(() => {
    requestAnimationFrame(() => cardRef.current?.focus());
  }, []);

  return (
    <div
      className="fixed inset-0 z-[4000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', animation: `overlayIn 0.2s ease both` }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="payment-processing-title"
    >
      <style>{`
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Train slides from left edge to right edge of the track */
        @keyframes trainMove {
          0%   { left: 0%; }
          100% { left: calc(100% - 26px); }
        }

        /* Track fill grows left → right in sync with the train */
        @keyframes trackFill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* Stop dot activates (grey → teal) when the train arrives */
        @keyframes dotActivate {
          from { background-color: white; border-color: ${GRAY_TRACK}; }
          to   { background-color: ${TEAL}; border-color: ${TEAL}; }
        }

        /* Teal halo pulse around the icon */
        @keyframes haloPulse {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%       { transform: scale(1.15); opacity: 0.6; }
        }

        /* Ellipsis dots for "Securing your ticket..." */
        @keyframes dot1 { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes dot2 { 0%,20%,100%{opacity:0} 60%{opacity:1} }
        @keyframes dot3 { 0%,40%,100%{opacity:0} 80%{opacity:1} }

        @media (prefers-reduced-motion: reduce) {
          @keyframes trainMove   { from{left:0%}  to{left:calc(100% - 26px)} }
          @keyframes trackFill   { from{width:0%} to{width:100%} }
          @keyframes haloPulse   { from{opacity:1} to{opacity:1} }
          @keyframes cardIn      { from{opacity:1} to{opacity:1} }
          @keyframes overlayIn   { from{opacity:1} to{opacity:1} }
          @keyframes dot1        { 0%,100%{opacity:1} }
          @keyframes dot2        { 0%,100%{opacity:1} }
          @keyframes dot3        { 0%,100%{opacity:1} }
        }
      `}</style>

      {/* Card */}
      <div
        ref={cardRef}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden focus:outline-none"
        style={{ animation: `cardIn 0.25s ease 0.05s both` }}
      >
        {/* Teal header stripe */}
        <div style={{ height: 4, background: TEAL, width: '100%' }} />

        <div className="px-8 pt-7 pb-8 text-center">
          {/* Pulsing teal halo + train icon */}
          <div className="relative flex items-center justify-center mb-5 mx-auto w-16 h-16">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: TEAL_LIGHT,
                animation: `haloPulse 1.1s ease-in-out infinite`,
              }}
            />
            <MdTrain size={32} color={TEAL} aria-hidden="true" />
          </div>

          <p id="payment-processing-title" className="text-base font-bold text-gray-900 mb-1">Processing payment</p>

          {/* Animated ellipsis */}
          <p className="text-sm text-gray-400 mb-7 flex items-center justify-center gap-0.5">
            Securing your ticket
            <span style={{ animation: `dot1 1.2s ease-in-out infinite` }}>.</span>
            <span style={{ animation: `dot2 1.2s ease-in-out infinite` }}>.</span>
            <span style={{ animation: `dot3 1.2s ease-in-out infinite` }}>.</span>
          </p>

          {/* ── Route animation ──────────────────────────────────── */}
          {/*
           * Layout:
           *   [dot1]──────────[dot2]──────────[dot3]
           *    ↑ start           ↑ midpoint       ↑ destination
           * The teal fill and train icon move left→right in sync.
           * Each dot activates (grey→teal) as the train passes it.
           */}
          <div className="relative h-8 select-none" aria-hidden="true">
            {/* Grey background track */}
            <div
              className="absolute top-1/2 left-3 right-3 -translate-y-1/2 rounded-full"
              style={{ height: 3, backgroundColor: GRAY_TRACK }}
            />

            {/* Teal fill track — grows left→right */}
            <div
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full"
              style={{
                height: 3,
                backgroundColor: TEAL,
                width: 0,
                animation: `trackFill ${DURATION}s linear forwards`,
              }}
            />

            {/* Stop dot — departure (already teal from t=0) */}
            <div
              className="absolute top-1/2 left-3 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2"
              style={{ backgroundColor: TEAL, borderColor: TEAL }}
            />

            {/* Stop dot — midpoint (activates at ~50% of journey) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: 'white',
                borderColor: GRAY_TRACK,
                animation: `dotActivate 0.18s ease forwards ${DURATION * 0.5}s`,
              }}
            />

            {/* Stop dot — destination (activates just before completion) */}
            <div
              className="absolute top-1/2 right-3 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: 'white',
                borderColor: GRAY_TRACK,
                animation: `dotActivate 0.18s ease forwards ${DURATION * 0.97}s`,
              }}
            />

            {/* Train icon — slides along the track */}
            <div
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                left: 0,
                animation: `trainMove ${DURATION}s linear forwards`,
              }}
            >
              <MdTrain size={26} color={TEAL} />
            </div>
          </div>

          {/* Stop labels */}
          <div className="flex justify-between px-2 mt-2">
            <span className="text-[10px] font-medium text-gray-400">Departure</span>
            <span className="text-[10px] font-medium text-gray-400">Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
}
