import { KeyboardEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

export interface SnapPoint {
  /** Fraction of available viewport height (above BottomNav) the drawer occupies, e.g. 0.12 */
  vh: number;
  /** Human-readable label for ARIA announcements, e.g. "Collapsed" */
  label: string;
}

export interface BottomDrawerProps {
  children: ReactNode;
  /**
   * Ordered snap positions from smallest (peek) to largest (full).
   * Defaults to three positions: 12% / 50% / 92% of available height.
   */
  snapPoints?: SnapPoint[];
  /** Index into snapPoints for the initial position. Default: 1 (half). */
  defaultSnapIndex?: number;
  /** Called after each snap completes — useful for adjusting map padding. */
  onSnapChange?: (snapIndex: number, snapPoint: SnapPoint) => void;
  className?: string;
  'aria-label'?: string;
}

const DEFAULT_SNAP_POINTS: SnapPoint[] = [
  { vh: 0.12, label: 'Collapsed' },
  { vh: 0.50, label: 'Half open' },
  { vh: 0.92, label: 'Expanded'  },
];

/** Height of the persistent BottomNav bar (px). Drawer floats above this on mobile. */
const BOTTOM_NAV_HEIGHT = 64;

/**
 * Velocity (px/ms) above which a drag is treated as a directional fling,
 * snapping one level up or down regardless of distance.
 */
const FLING_VELOCITY_THRESHOLD = 0.5;

/**
 * BottomDrawer — a draggable bottom sheet on mobile, static left panel on desktop.
 *
 * ## Mobile (< lg)
 * Renders as a `fixed` panel anchored above the BottomNav. Three snap positions
 * (peek / half / full) are reached by dragging the handle or using arrow keys.
 * Uses `transform: translateY()` for GPU-accelerated animation.
 *
 * ## Desktop (≥ lg)
 * Renders as a `static` 420px left panel. The page must supply a `lg:flex`
 * container so the map sibling fills the remaining space.
 *
 * ## Z-index context
 * z-[1100] on mobile — sits above the Leaflet map, below BottomNav (z-[1200]),
 * UpdatePrompt (z-[3000]) and the skip link (z-[9999]).
 */
export default function BottomDrawer({
  children,
  snapPoints = DEFAULT_SNAP_POINTS,
  defaultSnapIndex = 1,
  onSnapChange,
  className = '',
  'aria-label': ariaLabel = 'Journey planner panel',
}: BottomDrawerProps) {
  const [snapIndex, setSnapIndex]   = useState(defaultSnapIndex);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Viewport dimensions — updated on resize / orientation change.
  const [windowHeight, setWindowHeight] = useState(
    () => (typeof window !== 'undefined' ? window.innerHeight : 800),
  );
  const [isDesktop, setIsDesktop] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false),
  );

  // Refs readable inside event handler closures without causing stale captures.
  const contentRef     = useRef<HTMLDivElement>(null);
  const dragStartY     = useRef(0);
  const lastY          = useRef(0);
  const lastTimestamp  = useRef(0);
  const velocityRef    = useRef(0);
  const dragOffsetRef  = useRef(0); // mirrors dragOffset state; readable in closures
  const mouseMoveRef   = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpRef     = useRef<((e: MouseEvent) => void) | null>(null);

  // Sync viewport dimensions on resize / orientation change.
  useEffect(() => {
    const onResize = () => {
      setWindowHeight(window.innerHeight);
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Defensive cleanup of window listeners if component unmounts mid-drag.
  useEffect(() => {
    return () => {
      if (mouseMoveRef.current) window.removeEventListener('mousemove', mouseMoveRef.current);
      if (mouseUpRef.current)   window.removeEventListener('mouseup',   mouseUpRef.current);
    };
  }, []);

  // ── Derived measurements ────────────────────────────────────────────────────
  const availableHeight  = windowHeight - BOTTOM_NAV_HEIGHT;
  const peekHeight       = snapPoints[0].vh * availableHeight;
  const maxDrawerHeight  = snapPoints[snapPoints.length - 1].vh * availableHeight;
  const committedHeight  = snapPoints[snapIndex].vh * availableHeight;

  // Height during an active drag, clamped to [peekHeight, maxDrawerHeight].
  const liveHeight = isDragging
    ? Math.max(peekHeight, Math.min(maxDrawerHeight, committedHeight - dragOffset))
    : committedHeight;

  // How far to translate the panel downward so only `liveHeight` px are visible.
  const translateY = maxDrawerHeight - liveHeight;

  // ── Snap logic ──────────────────────────────────────────────────────────────
  const snapToNearest = useCallback(
    (currentHeight: number) => {
      const v = velocityRef.current;
      let newIndex: number;

      if (v > FLING_VELOCITY_THRESHOLD) {
        // Fast downward fling → collapse one level.
        newIndex = Math.max(0, snapIndex - 1);
      } else if (v < -FLING_VELOCITY_THRESHOLD) {
        // Fast upward fling → expand one level.
        newIndex = Math.min(snapPoints.length - 1, snapIndex + 1);
      } else {
        // Snap to the nearest position by absolute distance.
        let closest = 0;
        let minDelta = Infinity;
        snapPoints.forEach((sp, i) => {
          const d = Math.abs(sp.vh * availableHeight - currentHeight);
          if (d < minDelta) { minDelta = d; closest = i; }
        });
        newIndex = closest;
      }

      setSnapIndex(newIndex);
      onSnapChange?.(newIndex, snapPoints[newIndex]);
      setAnnouncement(`Panel ${snapPoints[newIndex].label}`);
    },
    [snapIndex, snapPoints, availableHeight, onSnapChange],
  );

  // ── Touch handlers ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Prevent Leaflet from claiming the touch event on the underlying map.
    e.stopPropagation();
    const y = e.touches[0].clientY;
    dragStartY.current    = y;
    lastY.current         = y;
    lastTimestamp.current = Date.now();
    velocityRef.current   = 0;
    dragOffsetRef.current = 0;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const y       = e.touches[0].clientY;
    const now     = Date.now();
    const elapsed = now - lastTimestamp.current;
    if (elapsed > 0) velocityRef.current = (y - lastY.current) / elapsed;
    lastY.current         = y;
    lastTimestamp.current = now;
    const offset = y - dragStartY.current;
    dragOffsetRef.current = offset;
    setDragOffset(offset);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const offset   = dragOffsetRef.current;
    const currentH = Math.max(peekHeight, Math.min(maxDrawerHeight, committedHeight - offset));
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
    snapToNearest(currentH);
  }, [peekHeight, maxDrawerHeight, committedHeight, snapToNearest]);

  // ── Mouse handlers (enables drag testing on desktop) ────────────────────────
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault(); // prevent text selection during drag
      dragStartY.current    = e.clientY;
      lastY.current         = e.clientY;
      lastTimestamp.current = Date.now();
      velocityRef.current   = 0;
      dragOffsetRef.current = 0;
      setIsDragging(true);

      const onMove = (ev: MouseEvent) => {
        const now     = Date.now();
        const elapsed = now - lastTimestamp.current;
        if (elapsed > 0) velocityRef.current = (ev.clientY - lastY.current) / elapsed;
        lastY.current         = ev.clientY;
        lastTimestamp.current = now;
        const offset = ev.clientY - dragStartY.current;
        dragOffsetRef.current = offset;
        setDragOffset(offset);
      };

      const onUp = () => {
        const offset   = dragOffsetRef.current;
        const currentH = Math.max(peekHeight, Math.min(maxDrawerHeight, committedHeight - offset));
        dragOffsetRef.current = 0;
        setDragOffset(0);
        setIsDragging(false);
        snapToNearest(currentH);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup',   onUp);
        mouseMoveRef.current = null;
        mouseUpRef.current   = null;
      };

      mouseMoveRef.current = onMove;
      mouseUpRef.current   = onUp;
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    },
    [peekHeight, maxDrawerHeight, committedHeight, snapToNearest],
  );

  // ── Keyboard handler (on the drag handle) ───────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(snapPoints.length - 1, snapIndex + 1);
        setSnapIndex(next);
        onSnapChange?.(next, snapPoints[next]);
        setAnnouncement(`Panel ${snapPoints[next].label}`);
        // When fully expanded, move focus into the drawer content.
        if (next === snapPoints.length - 1 && contentRef.current) {
          const first = contentRef.current.querySelector<HTMLElement>(
            'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
          );
          first?.focus();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = Math.max(0, snapIndex - 1);
        setSnapIndex(prev);
        onSnapChange?.(prev, snapPoints[prev]);
        setAnnouncement(`Panel ${snapPoints[prev].label}`);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Toggle between peek (0) and full (last).
        const toggle = snapIndex === 0 ? snapPoints.length - 1 : 0;
        setSnapIndex(toggle);
        onSnapChange?.(toggle, snapPoints[toggle]);
        setAnnouncement(`Panel ${snapPoints[toggle].label}`);
      }
    },
    [snapIndex, snapPoints, onSnapChange],
  );

  // ── Inline styles (mobile only — on desktop the CSS classes take over) ──────
  const mobileStyle = isDesktop
    ? undefined
    : {
        height:     `${maxDrawerHeight}px`,
        transform:  `translateY(${translateY}px)`,
        transition: isDragging ? 'none' : 'var(--drawer-transition)',
      };

  return (
    <>
      <section
        aria-label={ariaLabel}
        className={[
          // ── Mobile: fixed bottom sheet sitting above the BottomNav ──────────
          'fixed bottom-16 left-0 right-0',
          'flex flex-col',
          'bg-surface-card rounded-t-2xl shadow-2xl',
          'z-[1100]',
          'will-change-transform',
          // ── Desktop: static left panel inside a parent flex container ───────
          // Note: the page must provide `lg:flex` on its root for the
          // side-by-side layout to take effect (SearchPage / ResultsPage).
          'lg:static lg:bottom-auto lg:left-auto lg:right-auto',
          'lg:w-[420px] lg:h-full lg:flex-shrink-0',
          'lg:rounded-none lg:shadow-[4px_0_16px_rgba(0,0,0,0.1)]',
          'lg:z-auto lg:will-change-auto',
          className,
        ].join(' ')}
        style={mobileStyle}
      >
        {/* ── Drag handle (mobile only) ────────────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${ariaLabel} — ${snapPoints[snapIndex].label}. Use arrow keys to resize`}
          aria-expanded={snapIndex > 0}
          aria-controls="drawer-content"
          className="lg:hidden flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onKeyDown={handleKeyDown}
        >
          <div className="w-10 h-1.5 rounded-full bg-content-disabled" aria-hidden="true" />
        </div>

        {/* ── Scrollable content ───────────────────────────────────────────── */}
        <div
          id="drawer-content"
          ref={contentRef}
          className="overflow-y-auto flex-1 overscroll-contain"
        >
          {children}
        </div>
      </section>

      {/* Visually hidden live region — announces snap changes to screen readers */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </span>
    </>
  );
}
