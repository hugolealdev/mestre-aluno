import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getAccessToken, setAccessToken, subscribeToAccessToken } from '../lib/auth-store';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => getAccessToken());
  const [checkingSession, setCheckingSession] = useState(() => !getAccessToken());

  useEffect(() => subscribeToAccessToken(setToken), []);

  useEffect(() => {
    if (token) {
      setCheckingSession(false);
      return;
    }

    let cancelled = false;

    apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
      skipAuthRefresh: true
    })
      .then((data) => {
        if (!cancelled && data.accessToken) {
          setAccessToken(data.accessToken);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAccessToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCheckingSession(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (checkingSession) {
    return (
      <section className="container-shell py-24">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">Validando sessão</p>
          <p className="mt-3 text-base text-slate-700">
            Estamos restaurando seu acesso seguro à plataforma.
          </p>
        </div>
      </section>
    );
  }

  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
}
