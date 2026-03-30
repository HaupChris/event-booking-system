import { API_BASE_URL, API_URL, VAPID_PUBLIC_KEY } from './config/env';

test('environment helper exposes string values', () => {
  expect(typeof API_BASE_URL).toBe('string');
  expect(typeof API_URL).toBe('string');
  expect(typeof VAPID_PUBLIC_KEY).toBe('string');
});
