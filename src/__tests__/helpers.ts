// Shared test helpers
import { NextRequest } from 'next/server';

/** Creates a NextRequest with optional body, method and cookies */
export function makeRequest(
  url: string,
  opts?: {
    method?: string;
    body?: unknown;
    cookies?: Record<string, string>;
  }
): NextRequest {
  const headers: Record<string, string> = {};
  if (opts?.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts?.cookies) {
    headers['Cookie'] = Object.entries(opts.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }
  return new NextRequest(url, {
    method: opts?.method ?? 'GET',
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
    headers,
  });
}
