import type { CombinedBooking } from '../interface';
import type { Booking, FormContent } from '../../userArea/interface';
import type { ArtistBooking, ArtistFormContent } from '../../artistArea/interface';
import {
  calculateTotalPriceArtist,
  calculateTotalPriceUser,
} from '../../../components/core/utils/Pricing';
import { getAdminTitle } from './titleUtils';

interface InviterFilterData {
  inviterFilterOptions: { value: string; label: string }[];
  hasUnassignedBookings: boolean;
}

/**
 * Gets the title of a ticket based on its ID and booking type
 */
export const getTicketTitle = (
  id: number,
  bookingType: 'regular' | 'artist',
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): string => {
  const options =
    bookingType === 'artist' ? artistFormContent.ticket_options : formContent.ticket_options;

  const option = options.find((opt) => opt.id === id);
  return option ? getAdminTitle(option) : 'Unknown';
};

/**
 * Gets information about a workshift and timeslot based on timeslot ID
 */
export const getTimeslotWithWorkshift = (id: number, formContent: FormContent) => {
  for (const shift of formContent.work_shifts) {
    const timeslot = shift.time_slots.find((slot) => slot.id === id);
    if (timeslot) {
      return {
        workshiftTitle: getAdminTitle(shift),
        timeslotTitle: getAdminTitle(timeslot),
        timeslotStart: timeslot.start_time,
        timeslotEnd: timeslot.end_time,
      };
    }
  }
  return {
    workshiftTitle: 'Unknown',
    timeslotTitle: 'Unknown',
    timeslotStart: '',
    timeslotEnd: '',
  };
};

/**
 * Calculates the total price for a booking based on selected options
 */
export function calculateTotalPrice(
  booking: CombinedBooking,
  _field: string,
  _value: unknown,
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): number {
  if (booking.bookingType === 'artist') {
    return calculateTotalPriceArtist(booking as ArtistBooking, artistFormContent);
  }
  if (booking.bookingType === 'regular') {
    return calculateTotalPriceUser(booking as Booking, formContent);
  }
  return -1;
}

/**
 * Sorts bookings based on given criteria and order
 */
export const sortBookings = (
  bookings: CombinedBooking[],
  sortCriterion: 'first_name' | 'last_name' | 'timestamp',
  sortOrder: 'asc' | 'desc'
): CombinedBooking[] => {
  return [...bookings].sort((a, b) => {
    const compare = (aValue: string | number, bValue: string | number) => {
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    };

    switch (sortCriterion) {
      case 'first_name':
        return compare(a.first_name, b.first_name);
      case 'last_name':
        return compare(a.last_name, b.last_name);
      case 'timestamp':
      default:
        return compare(a.timestamp, b.timestamp);
    }
  });
};

/**
 * Filters bookings based on view type and search query
 */
export const filterBookings = (
  bookings: CombinedBooking[],
  viewType: 'all' | 'regular' | 'artist',
  searchQuery: string,
  invitedByFilter: string = 'all'
): CombinedBooking[] => {
  return bookings
    .filter((booking) => viewType === 'all' || booking.bookingType === viewType)
    .filter((booking) => {
      if (invitedByFilter === 'all') {
        return true;
      }

      if (invitedByFilter === 'unassigned') {
        return !booking.invited_by_id || booking.invited_by_id < 0;
      }

      return String(booking.invited_by_id) === invitedByFilter;
    })
    .filter(
      (booking) =>
        booking.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
};

export const getInviterFilterData = (bookings: CombinedBooking[]): InviterFilterData => {
  const inviterMap = new Map<string, string>();
  let hasUnassigned = false;

  bookings.forEach((booking) => {
    if (!booking.invited_by_id || booking.invited_by_id < 0) {
      hasUnassigned = true;
      return;
    }

    const fallbackName = `ID ${booking.invited_by_id}`;
    const name = booking.invited_by_name?.trim() || fallbackName;
    inviterMap.set(String(booking.invited_by_id), name);
  });

  const options = Array.from(inviterMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'de'));

  return {
    inviterFilterOptions: options,
    hasUnassignedBookings: hasUnassigned,
  };
};
