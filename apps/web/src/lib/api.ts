const API_URL = import.meta.env.VITE_API_URL;
let refreshPromise: Promise<string | null> | null = null;

export type ApiRequestOptions = RequestInit & {
  accessToken?: string | null;
  skipAuthRefresh?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401 && shouldTryRefresh(path, options.skipAuthRefresh)) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return apiRequest<T>(path, {
        ...options,
        accessToken: refreshedToken,
        skipAuthRefresh: true
      });
    }
  }

  if (!response.ok) {
    const body = await safeJson(response);
    throw new Error(body?.message ?? 'Falha na requisição.');
  }

  return safeJson(response) as Promise<T>;
}

async function safeJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        credentials: 'include'
      });

      if (!response.ok) {
        const { setAccessToken } = await import('./auth-store');
        setAccessToken(null);
        return null;
      }

      const data = (await safeJson(response)) as { accessToken?: string } | null;
      const accessToken = data?.accessToken ?? null;
      const { setAccessToken } = await import('./auth-store');
      setAccessToken(accessToken);
      return accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function shouldTryRefresh(path: string, skipAuthRefresh?: boolean) {
  if (skipAuthRefresh) {
    return false;
  }

  return !['/auth/login', '/auth/register', '/auth/refresh'].some((authPath) =>
    path.startsWith(authPath)
  );
}
