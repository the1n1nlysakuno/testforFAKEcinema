export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_STORAGE_KEY = 'cgv_token';
export const USER_STORAGE_KEY = 'cgv_auth_user';

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  isNetworkError: boolean;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown,
    isNetworkError = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.isNetworkError;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

function buildUrl(path: string): string {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  const text = await response.text();
  return text || null;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const errorText = (payload as { error?: unknown }).error;
    if (typeof errorText === 'string' && errorText.trim()) return errorText;
  }
  if (typeof payload === 'string' && payload.trim()) return payload;
  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      serializedBody = body;
    } else {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      serializedBody = JSON.stringify(body);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers,
      body: serializedBody,
    });
  } catch (error) {
    throw new ApiError(
      'Không thể kết nối đến máy chủ API.',
      0,
      'NETWORK_ERROR',
      error,
      true
    );
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      throw new ApiError(
        extractErrorMessage(
          payload,
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        ),
        401,
        'UNAUTHORIZED',
        payload
      );
    }

    if (response.status === 409) {
      throw new ApiError(
        extractErrorMessage(
          payload,
          'Ghế bạn chọn đã có người đặt. Vui lòng chọn ghế khác.'
        ),
        409,
        'CONFLICT',
        payload
      );
    }

    throw new ApiError(
      extractErrorMessage(payload, `Yêu cầu thất bại (HTTP ${response.status}).`),
      response.status,
      'HTTP_ERROR',
      payload
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
