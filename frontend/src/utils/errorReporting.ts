/**
 * Error codes and error reports from the browser (docs/LOGGING.md).
 *
 * - Every API response carries `X-Request-ID`. Error messages show it as "Fehlercode", so people
 *   can send it along and the matching log lines are found directly.
 * - Unexpected errors (render errors, uncaught errors, failed API calls with 5xx or no response)
 *   are reported to `POST /api/client-errors`. Never send form data, user input or profile UUIDs.
 */

import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';
import { API_URL } from '../config/env';

export type ClientErrorKind = 'render_error' | 'window_error' | 'unhandled_rejection' | 'api_error';

export interface ClientErrorReport {
  kind: ClientErrorKind;
  message?: string;
  stack?: string;
  requestId?: string;
  status?: number;
}

export const CLIENT_ERRORS_URL = `${API_URL ? `${API_URL}/api` : '/api'}/client-errors`;
export const MAX_REPORTS_PER_PAGE = 10;
const MAX_MESSAGE_LENGTH = 200;
const MAX_STACK_LENGTH = 2000;
const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? 'dev';
const UUID_PATTERN = /[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}/gi;
const REQUEST_ID_PATTERN = /^[0-9a-f]{8}$/;

const sentReports = new Set<string>();

export const maskUuids = (value: string): string => value.replace(UUID_PATTERN, '<uuid>');

const truncate = (value: string | undefined, maxLength: number): string | undefined =>
  value ? maskUuids(value).slice(0, maxLength) : undefined;

/** Request ID of a failed API call, shown to people as "Fehlercode". */
export const getErrorCode = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }
  const requestId: unknown = error.response?.headers?.['x-request-id'];
  return typeof requestId === 'string' && REQUEST_ID_PATTERN.test(requestId)
    ? requestId
    : undefined;
};

export const withErrorCode = (message: string, error: unknown): string => {
  const code = getErrorCode(error);
  return code ? `${message} (Fehlercode: ${code})` : message;
};

/** Send a report; never throws and sends each distinct error once per page load. */
export const reportClientError = (report: ClientErrorReport): void => {
  const key = `${report.kind}|${report.message ?? ''}|${report.status ?? ''}`;
  if (sentReports.has(key) || sentReports.size >= MAX_REPORTS_PER_PAGE) {
    return;
  }
  sentReports.add(key);

  const body = JSON.stringify({
    kind: report.kind,
    message: truncate(report.message, MAX_MESSAGE_LENGTH),
    stack: truncate(report.stack, MAX_STACK_LENGTH),
    route: maskUuids(window.location.pathname),
    request_id: report.requestId,
    status: report.status,
    app_version: APP_VERSION,
  });
  try {
    fetch(CLIENT_ERRORS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Reporting must never break the app.
  }
};

/** Report API calls that failed on the server (5xx) or got no response at all. */
export const reportApiError = (error: AxiosError): void => {
  const status = error.response?.status;
  if (status !== undefined && status < 500) {
    return; // 4xx are expected answers (validation, login, not found)
  }
  const method = (error.config?.method ?? 'get').toUpperCase();
  const url = (error.config?.url ?? '').split('?')[0];
  reportClientError({
    kind: 'api_error',
    message: `${method} ${url}: ${error.message}`,
    requestId: getErrorCode(error),
    status,
  });
};

export const installApiErrorReporting = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(undefined, (error: unknown) => {
    if (axios.isAxiosError(error)) {
      reportApiError(error);
    }
    return Promise.reject(error);
  });
};

/** Report uncaught errors and unhandled promise rejections (API errors are reported already). */
export const installGlobalErrorHandlers = (): void => {
  window.addEventListener('error', (event: ErrorEvent) => {
    const error = event.error as Error | undefined;
    const message = event.message || error?.message;
    if (message?.includes('ResizeObserver loop')) {
      return; // harmless browser notice
    }
    reportClientError({
      kind: 'window_error',
      message,
      stack: error?.stack,
    });
  });
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason: unknown = event.reason;
    if (axios.isAxiosError(reason)) {
      return;
    }
    reportClientError({
      kind: 'unhandled_rejection',
      message: reason instanceof Error ? reason.message : typeof reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
};

/** Only for tests. */
export const resetSentReports = (): void => sentReports.clear();
