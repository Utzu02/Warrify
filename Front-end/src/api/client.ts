import { BASE_URL } from '../config';

export type ApiOptions = RequestInit & {
  skipAuth?: boolean;
};

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const init: RequestInit = { ...rest };
  const mergedHeaders = new Headers(headers || undefined);

  // No need to manually set user ID - JWT is sent automatically via httpOnly cookie
  
  if (init.body instanceof FormData) {
    // let browser set boundary
  } else if (init.body && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  init.headers = mergedHeaders;
  init.credentials = 'include'; // Send httpOnly cookies

  const response = await fetch(`${BASE_URL}${path}`, init);
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && 'error' in data ? (data as Record<string, string>).error : response.statusText) ||
      'Request failed';
    throw new Error(message);
  }

  return data as T;
}
