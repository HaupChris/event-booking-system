/**
 * Shared validation rules for form fields across the application.
 * These rules are used by both user and artist registration forms.
 */

/**
 * Validates a name field (first name or last name).
 * Allows letters (including German umlauts) and spaces.
 */
export const validateName = (value: string, fieldName: string): string => {
    const pattern = /^[A-Za-zÄÖÜäöüß\s]+$/;
    if (value === '') return `Bitte gib ${fieldName === 'first_name' ? 'einen Vornamen' : 'einen Nachnamen'} an`;
    if (!pattern.test(value)) return `Bitte verwende nur Buchstaben für ${fieldName === 'first_name' ? 'deinen Vornamen' : 'deinen Nachnamen'}`;
    return '';
};

/**
 * Validates an email address.
 */
export const validateEmail = (value: string): string => {
    const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (value === '') return 'Bitte gib eine Email ein';
    if (!pattern.test(value)) return 'Bitte gib eine gültige Email ein.';
    return '';
};

/**
 * Validates a phone number (10-15 digits).
 */
export const validatePhone = (value: string): string => {
    const pattern = /^\d{10,15}$/;
    if (value === '') return 'Bitte gib eine Telefonnummer ein';
    if (!pattern.test(value)) return 'Bitte gib eine gültige Telefonnummer ein';
    return '';
};

/**
 * Validates that a selection has been made (not -1).
 */
export const validateRequiredSelect = (value: number, fieldLabel: string): string => {
    return value === -1 ? `Bitte wähle ${fieldLabel} aus.` : '';
};

/**
 * Validates that a text field is not empty.
 */
export const validateRequiredText = (value: string, fieldLabel: string): string => {
    return value === '' ? `Bitte gib ${fieldLabel} an.` : '';
};

/**
 * Validates signature field with a friendly message.
 */
export const validateSignature = (value: string): string => {
    return value === '' ? 'Wir würden uns freuen, wenn du das Formular unterschreibst' : '';
};

/**
 * Validates that time slot priorities are set.
 */
export const validateTimeslotPriority = (value: number): string => {
    return value === -1 ? 'Bitte gib drei Prioritäten an.' : '';
};