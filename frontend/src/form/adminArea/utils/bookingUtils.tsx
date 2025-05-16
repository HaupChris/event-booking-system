import { CombinedBooking } from "../interface";
import { FormContent } from "../../userArea/interface";
import {ArtistFormContent} from "../../artistArea/interface";

/**
 * Gets the title of a ticket based on its ID and booking type
 */
export const getTicketTitle = (
  id: number,
  bookingType: 'regular' | 'artist',
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): string => {
  const options = bookingType === 'artist'
    ? artistFormContent.ticket_options
    : formContent.ticket_options;

  const option = options.find(opt => opt.id === id);
  return option ? option.title : 'Unknown';
};

/**
 * Gets information about a workshift and timeslot based on timeslot ID
 */
export const getTimeslotWithWorkshift = (id: number, formContent: FormContent) => {
  for (const shift of formContent.work_shifts) {
    const timeslot = shift.time_slots.find(slot => slot.id === id);
    if (timeslot) {
      return {
        workshiftTitle: shift.title,
        timeslotTitle: timeslot.title,
        timeslotStart: timeslot.start_time,
        timeslotEnd: timeslot.end_time
      };
    }
  }
  return {
    workshiftTitle: 'Unknown',
    timeslotTitle: 'Unknown',
    timeslotStart: '',
    timeslotEnd: ''
  };
};

/**
 * Calculates the total price for a booking based on selected options
 */
export const calculateTotalPrice = (
  booking: CombinedBooking,
  field: string,
  value: any,
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): number => {
  const options = booking.bookingType === 'artist' ? artistFormContent : formContent;
  let totalPrice = 0;

  // Add ticket price
  const ticketId = field === 'ticket_id' ? value : booking.ticket_id;
  const ticketOption = options.ticket_options.find(t => t.id === ticketId);
  if (ticketOption) totalPrice += ticketOption.price;

  // Add beverage price
  const beverageId = field === 'beverage_id' ? value : booking.beverage_id;
  if (beverageId !== -1) {
    const beverageOption = options.beverage_options.find(b => b.id === beverageId);
    if (beverageOption) totalPrice += beverageOption.price;
  }

  // Add food price
  const foodId = field === 'food_id' ? value : booking.food_id;
  if (foodId !== -1) {
    const foodOption = options.food_options.find(f => f.id === foodId);
    if (foodOption) totalPrice += foodOption.price;
  }

  return totalPrice;
};

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
  searchQuery: string
): CombinedBooking[] => {
  return bookings
    .filter(booking =>
      viewType === 'all' || booking.bookingType === viewType
    )
    .filter(booking =>
      booking.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
};