export type ApiErrorBody = {
  ok?: boolean;
  error?: string | { code?: string; message?: string };
  message?: string;
};

export function parseApiErrorBody(data: ApiErrorBody | null | undefined, fallback: string): string {
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error === 'object' && typeof data.error.message === 'string') {
    return data.error.message;
  }
  if (typeof data?.message === 'string') return data.message;
  return fallback;
}

export async function parseApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as ApiErrorBody;
    return parseApiErrorBody(data, fallback);
  } catch {
    return fallback;
  }
}
