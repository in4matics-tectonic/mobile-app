// Tiny HTTP layer. Without EXPO_PUBLIC_API_URL every call goes to the in-memory mock server
// (with simulated latency); set the variable to talk to a real backend with the same contracts.

import { handleMockRequest, MockHttpError } from '../mocks/mockServer';
import { TIMING } from '../mocks/tomEnLien';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

type Method = 'GET' | 'POST';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mockRequest<T>(method: Method, path: string, body: unknown): Promise<T> {
  await delay(TIMING.apiLatency);
  try {
    // Serialize like a real network hop so callers never share objects with the mock db.
    return JSON.parse(JSON.stringify(handleMockRequest(method, path, body))) as T;
  } catch (e) {
    if (e instanceof MockHttpError) throw new ApiError(e.status, e.message);
    throw e;
  }
}

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  if (!BASE_URL) return mockRequest<T>(method, path, body);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return (await res.json()) as T;
}
