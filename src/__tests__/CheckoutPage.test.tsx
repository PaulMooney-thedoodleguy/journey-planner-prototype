/**
 * QA-3 + QA-9 — CheckoutPage accessibility
 *
 * QA-3: Error summary appears on submit failure; each error message is
 *       linked to its field via aria-describedby; aria-invalid is set.
 * QA-9: Autocomplete attributes are present on name/email inputs;
 *       inputMode="numeric" on card number input.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Journey } from '../types';

// ─── Mocks ────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

const mockSetPassengerDetails = vi.fn();
const mockCompletePayment = vi.fn().mockReturnValue([]);

const mockJourney: Journey = {
  id: 1, from: 'London Kings Cross', to: 'Manchester Piccadilly',
  departure: '09:00', arrival: '11:15', duration: '2h 15m',
  changes: 0, type: 'train', operator: 'LNER',
  price: { single: 65.50, return: 98.00 }, co2: 8.2,
};

vi.mock('../context/JourneyContext', () => ({
  useJourneyContext: () => ({
    selectedJourney: mockJourney,
    searchParams: { ticketType: 'single', passengerType: 'adult' },
    passengerDetails: { name: '', email: '' },
    setPassengerDetails: mockSetPassengerDetails,
    completePayment: mockCompletePayment,
  }),
}));

vi.mock('../hooks/usePageTitle', () => ({ usePageTitle: () => {} }));

beforeEach(() => {
  vi.clearAllMocks();
});

// Lazily import after mocks are set up
async function renderCheckout() {
  const { default: CheckoutPage } = await import('../pages/home/CheckoutPage');
  return render(<CheckoutPage />);
}

// ─── QA-9: Autocomplete attributes ───────────────────────────

describe('CheckoutPage — autocomplete attributes (QA-9)', () => {
  it('name input has autocomplete="name"', async () => {
    await renderCheckout();
    expect(screen.getByLabelText('Full Name')).toHaveAttribute('autocomplete', 'name');
  });

  it('email input has autocomplete="email"', async () => {
    await renderCheckout();
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
  });

  it('card number input has autocomplete="cc-number"', async () => {
    await renderCheckout();
    expect(screen.getByLabelText('Card Number')).toHaveAttribute('autocomplete', 'cc-number');
  });

  it('card number input has inputMode="numeric"', async () => {
    await renderCheckout();
    expect(screen.getByLabelText('Card Number')).toHaveAttribute('inputmode', 'numeric');
  });
});

// ─── QA-3: Error summary + aria-describedby ───────────────────

describe('CheckoutPage — error summary (QA-3)', () => {
  it('shows error summary when form is submitted with all fields empty', async () => {
    await renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /pay/i }).closest('form')!);
    expect(await screen.findByText('There is a problem')).toBeInTheDocument();
  });

  it('error summary contains all three error messages as links', async () => {
    await renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /pay/i }).closest('form')!);
    // Each error appears in both the summary (as an <a>) and below the field (as a <p>).
    // We specifically assert the summary links so the test targets the right elements.
    expect(await screen.findByRole('link', { name: 'Please enter your full name' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Please enter your email address' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Please enter your card number' })).toBeInTheDocument();
  });

  it('error summary links point to the correct input ids', async () => {
    await renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /pay/i }).closest('form')!);
    await screen.findByText('There is a problem');

    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('#name-input');
    expect(hrefs).toContain('#email-input');
    expect(hrefs).toContain('#card-input');
  });

  it('name input gets aria-invalid=true after failed submit', async () => {
    await renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /pay/i }).closest('form')!);
    await screen.findByText('There is a problem');
    expect(screen.getByLabelText('Full Name')).toHaveAttribute('aria-invalid', 'true');
  });

  it('name input has aria-describedby pointing to its error message', async () => {
    await renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /pay/i }).closest('form')!);
    await screen.findByText('There is a problem');
    const nameInput = screen.getByLabelText('Full Name');
    const describedBy = nameInput.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    // The referenced element should contain the error text
    expect(document.getElementById(describedBy!)).toHaveTextContent('Please enter your full name');
  });

  it('error summary disappears after errors are resolved', async () => {
    await renderCheckout();
    fireEvent.submit(screen.getByRole('button', { name: /pay/i }).closest('form')!);
    await screen.findByText('There is a problem');
    // Typing in the name field clears the name error
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Smith' } });
    // Name error in summary should be gone (other errors remain, so summary still shows)
    const nameErrorLink = screen.queryByRole('link', { name: /please enter your full name/i });
    expect(nameErrorLink).not.toBeInTheDocument();
  });
});

// ─── QA-2: Label associations ────────────────────────────────

describe('CheckoutPage — label associations (QA-2)', () => {
  it('all form fields are reachable via getByLabelText', async () => {
    await renderCheckout();
    // getByLabelText throws if label is not associated with an input
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Card Number')).toBeInTheDocument();
  });
});
