import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getAccessToken, setAccessToken, subscribeToAccessToken } from '../lib/auth-store';

export function AppLayout() {
  const navigate = useNavigate();
  const [accessToken, setStoredAccessToken] = useState<string | null>(() => getAccessToken());

  useEffect(() => subscribeToAccessToken(setStoredAccessToken), []);

  async function handleLogout() {
    try {
      if (accessToken) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          accessToken
        });
      }
    } finally {
      setAccessToken(null);
      navigate('/auth');
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container-shell flex items-center justify-between py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Mestre Aluno
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            {accessToken ? (
              <>
                <Link
                  to="/painel"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Ir para o painel
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/auth">Entrar</Link>
                <Link
                  to="/painel"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Ir para o painel
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
