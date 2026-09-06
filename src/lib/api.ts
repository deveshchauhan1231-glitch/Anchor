import { ApiResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: any;

  constructor(message: string, code = 'API_ERROR', statusCode = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Universal API fetch wrapper attaching Clerk Bearer token and normalizing errors for Sonner toasts
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach token if provided, or dev user fallback
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    headers.set('x-dev-user-id', 'user_scholar_alex');
    headers.set('Authorization', 'Bearer user_scholar_alex');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json().catch(() => ({
      success: false,
      error: { code: 'PARSE_ERROR', message: 'Unable to parse server response' },
    }));

    if (!response.ok || !data.success) {
      const isServerError = response.status >= 500;

      const errorMsg = isServerError
        ? 'Something went wrong on our end. Please try again in a moment.'
        : data.error?.message || `Request failed with status ${response.status}`;

      throw new ApiError(
        errorMsg,
        data.error?.code || 'HTTP_ERROR',
        response.status,
        data.error?.details
      );
    }

    return data.data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network / connection refused error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to server. Please ensure the backend is running.',
        'NETWORK_DISCONNECTED',
        503
      );
    }

    throw new ApiError(
      error.message || 'An unexpected error occurred. Please try again.',
      'UNEXPECTED_ERROR',
      500
    );
  }
}

export async function aiBotClient<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(
    `/api/ai/${endpoint.replace(/^\//, '')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.detail || data?.message || `Request failed with status ${response.status}`,
      'AI_BOT_HTTP_ERROR',
      response.status
    );
  }

  return data as T;
}
