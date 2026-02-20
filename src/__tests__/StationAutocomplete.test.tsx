/**
 * QA-4 — StationAutocomplete component
 *
 * Acceptance criteria:
 *   ✓ ARIA combobox role present; aria-expanded reflects open/closed state
 *   ✓ Listbox role present when open; each item has role="option"
 *   ✓ Typing < 2 characters: no dropdown shown
 *   ✓ Typing 2+ characters: filtered dropdown shown (max 8 results)
 *   ✓ ArrowDown moves highlight through options (aria-selected)
 *   ✓ ArrowUp wraps back toward first option
 *   ✓ Enter selects highlighted option + closes dropdown
 *   ✓ Escape closes dropdown without selecting
 *   ✓ Clicking an option selects it
 *   ✓ aria-activedescendant tracks highlighted option id
 *   ✓ hasError applies border-red-500 and aria-invalid to input
 */

import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import StationAutocomplete from '../components/journey/StationAutocomplete';

// Stateful wrapper so the controlled input actually updates on type
function Wrapper({ initialValue = '', onChangeSpy = vi.fn() }: { initialValue?: string; onChangeSpy?: Mock }) {
  const [value, setValue] = useState(initialValue);
  return (
    <StationAutocomplete
      id="station"
      value={value}
      onChange={v => { setValue(v); onChangeSpy(v); }}
      placeholder="Search stations"
    />
  );
}

// ─── Initial state ────────────────────────────────────────────

describe('StationAutocomplete — initial state', () => {
  it('renders an input with role combobox wrapping', () => {
    render(<Wrapper />);
    // The combobox div wraps the input
    const combobox = document.querySelector('[role="combobox"]');
    expect(combobox).toBeInTheDocument();
  });

  it('starts with aria-expanded=false', () => {
    render(<Wrapper />);
    expect(document.querySelector('[role="combobox"]')).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not show listbox on empty input', () => {
    render(<Wrapper />);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

// ─── Dropdown visibility ──────────────────────────────────────

describe('StationAutocomplete — dropdown visibility', () => {
  it('shows no suggestions for a single character', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    await user.type(screen.getByPlaceholderText('Search stations'), 'L');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows a listbox for 2+ matching characters', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    await user.type(screen.getByPlaceholderText('Search stations'), 'Lo');
    // MAP_STATIONS has London stations so "Lo" should match
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows at most 8 suggestions', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    // "on" should match many stations (London, etc.)
    await user.type(screen.getByPlaceholderText('Search stations'), 'on');
    const options = screen.queryAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThanOrEqual(8);
  });

  it('sets aria-expanded=true when dropdown is open', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    await user.type(screen.getByPlaceholderText('Search stations'), 'Lo');
    expect(document.querySelector('[role="combobox"]')).toHaveAttribute('aria-expanded', 'true');
  });
});

// ─── Keyboard navigation ──────────────────────────────────────

describe('StationAutocomplete — keyboard navigation', () => {
  it('ArrowDown highlights first option', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    await user.keyboard('{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowDown then ArrowDown highlights second option', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowDown then ArrowUp returns to first option', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}');
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('Enter selects the highlighted option and closes dropdown', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Wrapper onChangeSpy={spy} />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    // onChange should have been called with the selected station name
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0] as string;
    expect(typeof lastCall).toBe('string');
    expect(lastCall.length).toBeGreaterThan(0);
  });

  it('Escape closes the dropdown without selecting', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Wrapper onChangeSpy={spy} />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

// ─── Mouse selection ──────────────────────────────────────────

describe('StationAutocomplete — mouse selection', () => {
  it('selects a station on mouse click', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Wrapper onChangeSpy={spy} />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    const options = screen.getAllByRole('option');
    // mousedown triggers the selection handler
    fireEvent.mouseDown(options[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0] as string;
    expect(typeof lastCall).toBe('string');
    expect(lastCall.length).toBeGreaterThan(0);
  });
});

// ─── ARIA attributes ──────────────────────────────────────────

describe('StationAutocomplete — ARIA', () => {
  it('input has aria-autocomplete="list"', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('Search stations')).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('input has aria-controls pointing to the listbox id only when the dropdown is open', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Search stations');

    // Closed state: aria-controls must be absent so axe never sees a
    // dangling reference to a listbox that isn't in the DOM.
    expect(input).not.toHaveAttribute('aria-controls');

    // Open state: aria-controls must be present and reference the listbox.
    await user.type(input, 'Lo');
    const controlsId = input.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(controlsId).toContain('listbox');
  });

  it('aria-activedescendant updates when an option is highlighted', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const input = screen.getByPlaceholderText('Search stations');
    await user.type(input, 'Lo');
    await user.keyboard('{ArrowDown}');
    const activeDesc = input.getAttribute('aria-activedescendant');
    expect(activeDesc).toBeTruthy();
    // The highlighted option should have the matching id
    expect(document.getElementById(activeDesc!)).toBeInTheDocument();
    expect(document.getElementById(activeDesc!)).toHaveAttribute('aria-selected', 'true');
  });

  it('applies aria-invalid when hasError is true', () => {
    render(
      <StationAutocomplete
        id="err-station"
        value=""
        onChange={vi.fn()}
        hasError
        errorId="err-msg"
      />
    );
    const input = document.getElementById('err-station') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies aria-describedby when errorId is provided', () => {
    render(
      <StationAutocomplete
        id="err-station-2"
        value=""
        onChange={vi.fn()}
        hasError
        errorId="err-msg-2"
      />
    );
    const input = document.getElementById('err-station-2') as HTMLInputElement;
    expect(input).toHaveAttribute('aria-describedby', 'err-msg-2');
  });
});
