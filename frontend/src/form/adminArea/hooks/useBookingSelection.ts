import { useEffect, useMemo, useState } from 'react';
import type { CombinedBooking } from '../interface';
import type { AdminBookingMailRecipient } from '../../../services/adminBookingMailService';

export const getBookingSelectionKey = (booking: CombinedBooking) =>
  `${booking.bookingType}:${booking.id}`;

export const useBookingSelection = (
  bookings: CombinedBooking[],
  visibleBookings: CombinedBooking[]
) => {
  const [selectedBookingKeys, setSelectedBookingKeys] = useState<Set<string>>(new Set());

  const selectedRecipients = useMemo<AdminBookingMailRecipient[]>(
    () =>
      bookings
        .filter((booking) => selectedBookingKeys.has(getBookingSelectionKey(booking)))
        .map((booking) => ({
          booking_id: booking.id,
          booking_type: booking.bookingType,
        })),
    [bookings, selectedBookingKeys]
  );

  const visibleBookingKeys = useMemo(
    () => visibleBookings.map((booking) => getBookingSelectionKey(booking)),
    [visibleBookings]
  );

  const allVisibleSelected =
    visibleBookingKeys.length > 0 &&
    visibleBookingKeys.every((key) => selectedBookingKeys.has(key));
  const someVisibleSelected =
    !allVisibleSelected && visibleBookingKeys.some((key) => selectedBookingKeys.has(key));

  useEffect(() => {
    const validKeys = new Set(bookings.map((booking) => getBookingSelectionKey(booking)));
    setSelectedBookingKeys((previous) => {
      const next = new Set(Array.from(previous).filter((key) => validKeys.has(key)));
      return next.size === previous.size ? previous : next;
    });
  }, [bookings]);

  const toggleSelectBooking = (booking: CombinedBooking) => {
    const bookingKey = getBookingSelectionKey(booking);
    setSelectedBookingKeys((previous) => {
      const next = new Set(previous);
      if (next.has(bookingKey)) {
        next.delete(bookingKey);
      } else {
        next.add(bookingKey);
      }
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedBookingKeys((previous) => {
      const next = new Set(previous);

      if (allVisibleSelected) {
        visibleBookingKeys.forEach((key) => next.delete(key));
      } else {
        visibleBookingKeys.forEach((key) => next.add(key));
      }

      return next;
    });
  };

  const clearSelection = () => {
    setSelectedBookingKeys(new Set());
  };

  return {
    selectedBookingKeys,
    selectedRecipients,
    allVisibleSelected,
    someVisibleSelected,
    toggleSelectBooking,
    toggleSelectAllVisible,
    clearSelection,
    setSelectedBookingKeys,
  };
};
