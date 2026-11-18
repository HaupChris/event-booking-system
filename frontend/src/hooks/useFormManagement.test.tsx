import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { useFormManagement } from './useFormManagement';

type Draft = { name: string; signature: string };

const STORAGE_KEY = 'test_booking';
const SIGNATURE_STEP = 2;
const options = {
  initialState: { name: '', signature: '' } as Draft,
  storageKey: STORAGE_KEY,
  transientKeys: ['signature'] as (keyof Draft)[],
  requiredFieldsByStep: { 0: ['name'], [SIGNATURE_STEP]: ['signature'] } as Record<
    number,
    (keyof Draft)[]
  >,
};

afterEach(() => localStorage.clear());

describe('useFormManagement draft storage (S6)', () => {
  test('never writes transient fields such as the signature to localStorage', () => {
    const { result } = renderHook(() => useFormManagement<Draft>(options));

    act(() => {
      result.current.updateField('name', 'Erika');
      result.current.updateField('signature', 'data:image/png;base64,AAAA');
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored).toEqual({ name: 'Erika' });
  });

  test('drops a signature from old drafts and resumes at the signature step at the latest', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Erika', signature: 'old' }));
    localStorage.setItem(`${STORAGE_KEY}_step`, '4');

    const { result } = renderHook(() => useFormManagement<Draft>(options));

    expect(result.current.formState).toEqual({ name: 'Erika', signature: '' });
    expect(result.current.activeStep).toBe(SIGNATURE_STEP);
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain('old');
  });

  test('keeps the stored step when it is before the signature step', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: 'Erika' }));
    localStorage.setItem(`${STORAGE_KEY}_step`, '1');

    const { result } = renderHook(() => useFormManagement<Draft>(options));

    expect(result.current.activeStep).toBe(1);
  });
});
