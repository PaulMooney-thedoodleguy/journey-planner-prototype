/**
 * QA-7 — Disruption banner display in JourneyCard
 *
 * Acceptance criteria:
 *   ✓ Banner with role="alert" shown for critical severity
 *   ✓ Banner shown for high severity
 *   ✗ No banner for medium severity
 *   ✗ No banner when disruption is null
 *   ✗ No banner when disruption prop is omitted
 *
 * Also smoke-tests that the card renders without crashing for the
 * three badge states (greenest / fastest / cheapest) and the
 * CO₂ vs car comparison label.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JourneyCard from '../components/journey/JourneyCard';
import type { Journey, Disruption } from '../types';

const baseJourney: Journey = {
  id: 1,
  from: 'London Kings Cross',
  to: 'Manchester Piccadilly',
  departure: '09:00',
  arrival: '11:15',
  duration: '2h 15m',
  changes: 0,
  type: 'train',
  operator: 'LNER',
  price: { single: 65.50, return: 98.00 },
  co2: 8.2,
  carCo2: 58,
};

const baseDisruption: Disruption = {
  id: 1,
  severity: 'critical',
  title: 'Signalling failure at Leeds',
  location: 'Leeds',
  description: 'Trains are subject to delays.',
  operator: 'LNER',
  updated: '2026-02-19T10:00:00',
};

function renderCard(overrides: {
  journey?: Partial<Journey>;
  disruption?: Disruption | null;
  isGreenest?: boolean;
  isFastest?: boolean;
  isCheapest?: boolean;
}) {
  return render(
    <JourneyCard
      journey={{ ...baseJourney, ...overrides.journey }}
      ticketType="single"
      isGreenest={overrides.isGreenest ?? false}
      isFastest={overrides.isFastest ?? false}
      isCheapest={overrides.isCheapest ?? false}
      onSelect={vi.fn()}
      disruption={overrides.disruption}
    />
  );
}

// ─── Disruption banner ────────────────────────────────────────

describe('JourneyCard — disruption banner', () => {
  it('shows alert banner for critical severity', () => {
    renderCard({ disruption: { ...baseDisruption, severity: 'critical' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Signalling failure at Leeds')).toBeInTheDocument();
  });

  it('shows alert banner for high severity', () => {
    renderCard({ disruption: { ...baseDisruption, severity: 'high', title: 'Strike action' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Strike action')).toBeInTheDocument();
  });

  it('does NOT show banner for medium severity', () => {
    renderCard({ disruption: { ...baseDisruption, severity: 'medium' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does NOT show banner for low severity', () => {
    renderCard({ disruption: { ...baseDisruption, severity: 'low' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does NOT show banner when disruption is null', () => {
    renderCard({ disruption: null });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does NOT show banner when disruption prop is omitted', () => {
    render(
      <JourneyCard
        journey={baseJourney}
        ticketType="single"
        isGreenest={false}
        isFastest={false}
        isCheapest={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// ─── CO₂ comparison label ────────────────────────────────────

describe('JourneyCard — CO₂ comparison', () => {
  it('shows percentage reduction label when carCo2 is present', () => {
    renderCard({});
    // 8.2 / 58 ≈ 85.86% savings → rounds to 86%
    expect(screen.getByText(/86% less than driving/i)).toBeInTheDocument();
  });

  it('does NOT show comparison when carCo2 is absent', () => {
    const { co2: _co2, carCo2: _carCo2, ...journeyWithoutCarCo2 } = baseJourney;
    render(
      <JourneyCard
        journey={{ ...journeyWithoutCarCo2, co2: 8.2 }}
        ticketType="single"
        isGreenest={false}
        isFastest={false}
        isCheapest={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.queryByText(/less than driving/i)).not.toBeInTheDocument();
  });
});

// ─── Badges ──────────────────────────────────────────────────

describe('JourneyCard — badges', () => {
  it('shows Greenest badge when isGreenest=true', () => {
    renderCard({ isGreenest: true });
    expect(screen.getByText('Greenest')).toBeInTheDocument();
  });

  it('shows Fastest badge when isFastest=true', () => {
    renderCard({ isFastest: true });
    expect(screen.getByText('Fastest')).toBeInTheDocument();
  });

  it('shows Cheapest badge when isCheapest=true', () => {
    renderCard({ isCheapest: true });
    expect(screen.getByText('Cheapest')).toBeInTheDocument();
  });
});

// ─── Leg detail toggle ───────────────────────────────────────

describe('JourneyCard — leg detail toggle', () => {
  it('shows toggle button when journey has legs', () => {
    renderCard({
      journey: {
        legs: [
          { mode: 'train', operator: 'LNER', from: 'London Kings Cross', to: 'Manchester Piccadilly',
            departure: '09:00', arrival: '11:15', duration: '2h 15m', platform: '5', stops: 2 },
        ],
      },
    });
    expect(screen.getByRole('button', { name: /show journey details/i })).toBeInTheDocument();
  });

  it('expands to show leg details on click', () => {
    renderCard({
      journey: {
        legs: [
          { mode: 'train', operator: 'LNER', from: 'London Kings Cross', to: 'Manchester Piccadilly',
            departure: '09:00', arrival: '11:15', duration: '2h 15m', platform: '5', stops: 2 },
        ],
      },
    });
    const toggle = screen.getByRole('button', { name: /show journey details/i });
    fireEvent.click(toggle);
    expect(screen.getByText(/hide journey details/i)).toBeInTheDocument();
    // Platform badge visible after expanding
    expect(screen.getByText(/plat\. 5/i)).toBeInTheDocument();
  });
});

// ─── Select callback ─────────────────────────────────────────

describe('JourneyCard — select button', () => {
  it('calls onSelect with the journey when Select is clicked', () => {
    const onSelect = vi.fn();
    render(
      <JourneyCard
        journey={baseJourney}
        ticketType="single"
        isGreenest={false}
        isFastest={false}
        isCheapest={false}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /select/i }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(baseJourney);
  });
});
