/**
 * Export service for transforming booking and form data into CSV-exportable format.
 * Extracted from Dashboard.tsx to improve maintainability and reduce file size.
 */

import type { BookingWithTimestamp, FormContent } from '../../userArea/interface';
import type { ArtistBookingWithTimestamp, ArtistFormContent } from '../../artistArea/interface';
import { getAdminTitle } from '../utils/titleUtils';
import { neutralizeCsvRows } from '../../../utils/csvSafety';

type ExportData = Record<string, unknown>;

/**
 * Transforms bookings data into export format
 */
export const exportBookingsData = (
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[],
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): ExportData[] => {
  return [
    ...regularBookings.map((b) => ({
      Type: 'Regular',
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      InvitedBy: b.invited_by_name || '',
      Phone: b.phone,
      Ticket: formContent.ticket_options.find((t) => t.id === b.ticket_id)?.title || 'Unknown',
      Price: b.total_price,
      PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
      RegistrationDate: b.timestamp,
    })),
    ...artistBookings.map((b) => ({
      Type: 'Artist',
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      InvitedBy: b.invited_by_name || '',
      Phone: b.phone,
      Ticket:
        artistFormContent.ticket_options.find((t) => t.id === b.ticket_id)?.title || 'Unknown',
      Price: b.total_price,
      PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
      RegistrationDate: b.timestamp,
    })),
  ];
};

/**
 * Transforms tickets data into export format
 */
export const exportTicketsData = (
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[],
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): ExportData[] => {
  return [
    ...regularBookings.map((b) => ({
      Type: 'Regular',
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      Ticket: formContent.ticket_options.find((t) => t.id === b.ticket_id)?.title || 'Unknown',
      TicketPrice: formContent.ticket_options.find((t) => t.id === b.ticket_id)?.price || 0,
    })),
    ...artistBookings.map((b) => ({
      Type: 'Artist',
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      Ticket:
        artistFormContent.ticket_options.find((t) => t.id === b.ticket_id)?.title || 'Unknown',
      TicketPrice: artistFormContent.ticket_options.find((t) => t.id === b.ticket_id)?.price || 0,
    })),
  ];
};

/**
 * Transforms beverages data into export format
 */
export const exportBeveragesData = (
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[],
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): ExportData[] => {
  return [
    ...regularBookings.map((b) => ({
      Type: 'Regular',
      FirstName: b.first_name,
      LastName: b.last_name,
      Beverage:
        formContent.beverage_options.find((bev) => bev.id === b.beverage_id)?.title || 'None',
      BeveragePrice:
        formContent.beverage_options.find((bev) => bev.id === b.beverage_id)?.price || 0,
    })),
    ...artistBookings.map((b) => ({
      Type: 'Artist',
      FirstName: b.first_name,
      LastName: b.last_name,
      Beverage:
        artistFormContent.beverage_options.find((bev) => bev.id === b.beverage_id)?.title || 'None',
      Description:
        artistFormContent.beverage_options.find((bev) => bev.id === b.beverage_id)?.title || 'None',
      BeveragePrice:
        artistFormContent.beverage_options.find((bev) => bev.id === b.beverage_id)?.price || 0,
    })),
  ];
};

/**
 * Transforms food data into export format
 */
export const exportFoodData = (
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[],
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): ExportData[] => {
  return [
    ...regularBookings.map((b) => ({
      Type: 'Regular',
      FirstName: b.first_name,
      LastName: b.last_name,
      Food: formContent.food_options.find((f) => f.id === b.food_id)?.title || 'None',
      Description: formContent.food_options.find((f) => f.id === b.food_id)?.description || 'None',
      FoodPrice: formContent.food_options.find((f) => f.id === b.food_id)?.price || 0,
    })),
    ...artistBookings.map((b) => ({
      Type: 'Artist',
      FirstName: b.first_name,
      LastName: b.last_name,
      Food: artistFormContent.food_options.find((f) => f.id === b.food_id)?.title || 'None',
      Description:
        artistFormContent.food_options.find((f) => f.id === b.food_id)?.description || 'None',
      FoodPrice: artistFormContent.food_options.find((f) => f.id === b.food_id)?.price || 0,
    })),
  ];
};

/**
 * Transforms materials data into export format (regular bookings only)
 */
export const exportMaterialsData = (
  regularBookings: BookingWithTimestamp[],
  formContent: FormContent
): ExportData[] => {
  return regularBookings
    .filter((b) => b.material_ids && b.material_ids.length > 0)
    .flatMap((b) => {
      return b.material_ids!.map((materialId) => ({
        FirstName: b.first_name,
        LastName: b.last_name,
        Material: formContent.materials.find((m) => m.id === materialId)?.title || 'Unknown',
      }));
    });
};

/**
 * Transforms artist materials data into export format
 */
export const exportArtistMaterialsData = (
  artistBookings: ArtistBookingWithTimestamp[],
  artistFormContent: ArtistFormContent
): ExportData[] => {
  return artistBookings
    .filter((b) => b.artist_material_ids?.length && b.artist_material_ids.length > 0)
    .flatMap((b) => {
      return (
        b.artist_material_ids?.map((materialId) => ({
          FirstName: b.first_name,
          LastName: b.last_name,
          Material:
            artistFormContent.artist_materials.find((m) => m.id === materialId)?.title || 'Unknown',
        })) || []
      );
    });
};

/**
 * Transforms work shifts data into export format
 */
export const exportWorkShiftsData = (
  regularBookings: BookingWithTimestamp[],
  formContent: FormContent
): ExportData[] => {
  return regularBookings.flatMap((b) => {
    const shifts: {
      FirstName: string;
      LastName: string;
      Priority: string;
      Workshift: string;
      Timeslot: string;
      StartTime: string;
      EndTime: string;
      MaxShifts: number;
    }[] = [];
    const priorities = ['First', 'Second', 'Third'];

    [b.timeslot_priority_1, b.timeslot_priority_2, b.timeslot_priority_3].forEach(
      (timeslotId, index) => {
        if (timeslotId === -1 || timeslotId === undefined) return;

        // Find the workshift and timeslot
        for (const shift of formContent.work_shifts) {
          const timeslot = shift.time_slots.find((ts) => ts.id === timeslotId);
          if (timeslot) {
            shifts.push({
              FirstName: b.first_name,
              LastName: b.last_name,
              Priority: priorities[index],
              Workshift: getAdminTitle(shift),
              Timeslot: getAdminTitle(timeslot),
              StartTime: timeslot.start_time,
              EndTime: timeslot.end_time,
              MaxShifts: b.amount_shifts || 0,
            });
            break;
          }
        }
      }
    );

    return shifts;
  });
};

/**
 * Transforms artist data into export format
 */
export const exportArtistsData = (artistBookings: ArtistBookingWithTimestamp[]): ExportData[] => {
  return artistBookings.map((b) => {
    let performanceDetails = '';
    try {
      if (b.performance_details) {
        const details = JSON.parse(b.performance_details);
        performanceDetails = `Day: ${details.preferredDay || '?'}, Time: ${details.preferredTime || '?'}, Duration: ${details.duration || '?'} min`;
      }
    } catch (e) {
      performanceDetails = 'Error parsing performance details';
    }

    return {
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      Phone: b.phone,
      PerformanceDetails: performanceDetails,
      Equipment: b.equipment || 'None specified',
      SpecialRequests: b.special_requests || 'None',
    };
  });
};

/**
 * Transforms financial/payment data into export format
 */
export const exportFinancialsData = (
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[]
): ExportData[] => {
  return [
    ...regularBookings.map((b) => ({
      Type: 'Regular',
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      InvitedBy: b.invited_by_name || '',
      TotalPrice: b.total_price,
      PaidAmount: b.paid_amount || 0,
      PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
      PaymentDate: b.payment_date || 'Not paid',
      Notes: b.payment_notes || '',
    })),
    ...artistBookings.map((b) => ({
      Type: 'Artist',
      FirstName: b.first_name,
      LastName: b.last_name,
      Email: b.email,
      InvitedBy: b.invited_by_name || '',
      TotalPrice: b.total_price,
      PaidAmount: b.paid_amount || 0,
      PaymentStatus: b.is_paid ? 'Paid' : 'Unpaid',
      PaymentDate: b.payment_date || 'Not paid',
      Notes: b.payment_notes || '',
    })),
  ];
};

/**
 * Main export function that routes to the appropriate transformer based on active tab.
 * All cells are protected against CSV formula injection.
 */
export const getExportDataByTab = (
  activeTab: string,
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[],
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): ExportData[] =>
  neutralizeCsvRows(
    selectExportData(activeTab, regularBookings, artistBookings, formContent, artistFormContent)
  );

const selectExportData = (
  activeTab: string,
  regularBookings: BookingWithTimestamp[],
  artistBookings: ArtistBookingWithTimestamp[],
  formContent: FormContent,
  artistFormContent: ArtistFormContent
): ExportData[] => {
  switch (activeTab) {
    case 'bookings':
      return exportBookingsData(regularBookings, artistBookings, formContent, artistFormContent);
    case 'tickets':
      return exportTicketsData(regularBookings, artistBookings, formContent, artistFormContent);
    case 'beverages':
      return exportBeveragesData(regularBookings, artistBookings, formContent, artistFormContent);
    case 'food':
      return exportFoodData(regularBookings, artistBookings, formContent, artistFormContent);
    case 'materials':
      return exportMaterialsData(regularBookings, formContent);
    case 'artistMaterials':
      return exportArtistMaterialsData(artistBookings, artistFormContent);
    case 'workShifts':
      return exportWorkShiftsData(regularBookings, formContent);
    case 'artists':
      return exportArtistsData(artistBookings);
    case 'financials':
    case 'payments':
      return exportFinancialsData(regularBookings, artistBookings);
    default:
      return [];
  }
};
