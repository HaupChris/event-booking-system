/**
 * Protection against CSV/formula injection (OWASP "CSV Injection").
 *
 * Spreadsheet apps treat cells starting with these characters as formulas. Exports contain
 * participant input (names, phone numbers, free text), so such cells are prefixed with a
 * single quote, which makes Excel and LibreOffice treat them as text.
 */
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export function neutralizeCsvCell<T>(value: T): T | string {
  if (typeof value === 'string' && FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return `'${value}`;
  }
  return value;
}

export function neutralizeCsvRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  return rows.map(
    (row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, neutralizeCsvCell(value)])
      ) as T
  );
}
