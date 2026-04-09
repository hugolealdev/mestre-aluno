const ACCESS_TOKEN_KEY = 'mestre-aluno.access-token';
const listeners = new Set<(token: string | null) => void>();

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  listeners.forEach((listener) => listener(token));
}

export function subscribeToAccessToken(listener: (token: string | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
