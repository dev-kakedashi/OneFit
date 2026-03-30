const LOCAL_API_ORIGIN = 'http://localhost:8000';

const trimTrailingSlash = (value: string): string =>
  value.endsWith('/') ? value.slice(0, -1) : value;

// 環境変数があればそれを優先し、未指定時だけローカル開発用の既定値へフォールバックする。
const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL?.trim() ||
    (typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? LOCAL_API_ORIGIN
      : ''),
);

type ErrorResponse = {
  code?: string;
  message?: string;
  detail?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const buildUrl = (
  path: string,
  query?: Record<string, string | number | undefined>,
): string => {
  const baseUrl =
    API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : LOCAL_API_ORIGIN);
  const url = new URL(path, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

// fetch の共通処理をここに集約し、各画面では loading / error と API 呼び出しだけに集中させる。
export const request = async <T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined>,
): Promise<T> => {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = '通信に失敗しました。';
    let code: string | undefined;

    try {
      const data = (await response.json()) as ErrorResponse;
      message = data.message ?? data.detail ?? message;
      code = data.code;
    } catch {
      // ignore parse errors
    }

    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const getErrorMessage = (
  error: unknown,
  fallback = 'エラーが発生しました。',
): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
