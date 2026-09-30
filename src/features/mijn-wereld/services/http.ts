// Transport to the in-memory mock server (with simulated latency), shaped like a network call so
// a mocked part can move to the real backend without touching its callers.

import { handleMockRequest, MockHttpError } from '../mocks/mockServer';
import { TIMING } from '../mocks/tomEnLien';

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

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  await delay(TIMING.apiLatency);
  try {
    // Serialize like a real network hop so callers never share objects with the mock db.
    return JSON.parse(JSON.stringify(handleMockRequest(method, path, body))) as T;
  } catch (e) {
    if (e instanceof MockHttpError) throw new ApiError(e.status, e.message);
    throw e;
  }
}
