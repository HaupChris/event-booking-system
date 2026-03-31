export const DEFAULT_PAYMENT_LINK = 'https://www.paypal.me/Wiesenwahn';

export const resolvePaymentLink = (value?: string | null): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : DEFAULT_PAYMENT_LINK;
};
