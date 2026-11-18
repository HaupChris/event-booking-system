import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { afterEach, describe, expect, test, vi } from 'vitest';
import BookingEventHistory from './BookingEventHistory';

vi.mock('axios');
const mockedGet = vi.mocked(axios.get);

afterEach(() => vi.resetAllMocks());

describe('BookingEventHistory (Phase L)', () => {
  test('shows the booking reference and events newest first', async () => {
    mockedGet.mockResolvedValue({
      data: {
        booking_ref: 'R-12',
        events: [
          {
            id: 1,
            event: 'booking_created',
            details: { ticket_id: 0 },
            created_at: '2026-11-18T10:00:00+00:00',
          },
          {
            event: 'confirmation_mail_failed',
            details: {},
            created_at: '2026-11-18T10:00:05+00:00',
          },
        ],
      },
    });

    render(<BookingEventHistory bookingType="regular" bookingId={12} token="t" />);

    expect(await screen.findByText('R-12')).toBeInTheDocument();
    const labels = screen.getAllByText(/Booking created|Confirmation mail failed/);
    expect(labels.map((element) => element.textContent)).toEqual([
      'Confirmation mail failed',
      'Booking created',
    ]);
    expect(screen.getByText(/ticket_id: 0/)).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith('/api/admin/bookings/regular/12/events', {
      headers: { Authorization: 'Bearer t' },
    });
  });

  test('explains when no events exist yet', async () => {
    mockedGet.mockResolvedValue({ data: { booking_ref: 'A-3', events: [] } });

    render(<BookingEventHistory bookingType="artist" bookingId={3} token="t" />);

    expect(await screen.findByText('No events recorded yet.')).toBeInTheDocument();
  });

  test('shows an error when the history cannot be loaded', async () => {
    mockedGet.mockRejectedValue(new Error('network'));

    render(<BookingEventHistory bookingType="regular" bookingId={1} token="t" />);

    expect(await screen.findByText('History could not be loaded.')).toBeInTheDocument();
  });
});
