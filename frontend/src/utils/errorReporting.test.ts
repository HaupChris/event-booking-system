import { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import {
  CLIENT_ERRORS_URL,
  MAX_REPORTS_PER_PAGE,
  getErrorCode,
  reportApiError,
  reportClientError,
  resetSentReports,
  withErrorCode,
} from './errorReporting';

const PROFILE_UUID = '11111111-2222-4333-8444-555555555555';

const axiosError = (status: number | undefined, requestId?: string): AxiosError => {
  const config = {
    method: 'get',
    url: `/api/profile/${PROFILE_UUID}?x=1`,
    headers: new AxiosHeaders(),
  } as InternalAxiosRequestConfig;
  const response =
    status === undefined
      ? undefined
      : {
          status,
          statusText: '',
          data: {},
          config,
          headers: requestId ? { 'x-request-id': requestId } : {},
        };
  return new AxiosError('Request failed', 'ERR', config, {}, response);
};

const sentBodies = (fetchMock: ReturnType<typeof vi.fn>) =>
  fetchMock.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string));

describe('errorReporting', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    resetSentReports();
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    window.history.pushState({}, '', `/profile/${PROFILE_UUID}`);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the request id of a failed call as error code', () => {
    const error = axiosError(500, 'a1b2c3d4');

    expect(getErrorCode(error)).toBe('a1b2c3d4');
    expect(withErrorCode('Fehler.', error)).toBe('Fehler. (Fehlercode: a1b2c3d4)');
    expect(withErrorCode('Fehler.', new Error('x'))).toBe('Fehler.');
    expect(getErrorCode(axiosError(500, '<script>'))).toBeUndefined();
  });

  it('reports server errors without profile uuids', () => {
    reportApiError(axiosError(500, 'a1b2c3d4'));

    expect(fetchMock).toHaveBeenCalledWith(CLIENT_ERRORS_URL, expect.anything());
    const [body] = sentBodies(fetchMock);
    expect(body).toMatchObject({
      kind: 'api_error',
      message: 'GET /api/profile/<uuid>: Request failed',
      route: '/profile/<uuid>',
      request_id: 'a1b2c3d4',
      status: 500,
    });
    expect(JSON.stringify(body)).not.toContain(PROFILE_UUID);
  });

  it('reports missing responses but not expected client errors', () => {
    reportApiError(axiosError(404));
    reportApiError(axiosError(422));
    expect(fetchMock).not.toHaveBeenCalled();

    reportApiError(axiosError(undefined));
    expect(sentBodies(fetchMock)[0]).toMatchObject({ kind: 'api_error' });
  });

  it('sends each error once and caps reports per page', () => {
    reportClientError({ kind: 'window_error', message: 'same' });
    reportClientError({ kind: 'window_error', message: 'same' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    for (let i = 0; i < MAX_REPORTS_PER_PAGE * 2; i += 1) {
      reportClientError({ kind: 'window_error', message: `error ${i}` });
    }
    expect(fetchMock).toHaveBeenCalledTimes(MAX_REPORTS_PER_PAGE);
  });

  it('never throws when reporting fails', () => {
    fetchMock.mockImplementation(() => {
      throw new Error('offline');
    });

    expect(() => reportClientError({ kind: 'render_error', message: 'x' })).not.toThrow();
  });
});
