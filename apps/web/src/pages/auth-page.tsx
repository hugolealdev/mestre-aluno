import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { getAccessToken, setAccessToken } from '../lib/auth-store';

type AuthMode = 'login' | 'register';
type UserRole = 'STUDENT' | 'TEACHER';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      navigate(searchParams.get('redirect') ?? '/painel', { replace: true });
    }
  }, [navigate, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest<{ accessToken: string }>(
        mode === 'login' ? '/auth/login' : '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(
            mode === 'login'
              ? { email, password }
              : { fullName, email, password, role, phone }
          )
        }
      );

      setAccessToken(data.accessToken);
      navigate(searchParams.get('redirect') ?? '/painel');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-shell py-20">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-slate-950 p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            Autenticação real
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Entre na plataforma e continue sua jornada.
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Sessões com access token de 15 minutos, refresh token de 7 dias e API oficial da
            plataforma.
          </p>
        </div>
        <div className="p-8 lg:p-10">
          <div className="flex gap-3 rounded-2xl bg-slate-100 p-2">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === 'register' ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Nome completo</span>
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Telefone</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Perfil</span>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as UserRole)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option value="STUDENT">Aluno</option>
                    <option value="TEACHER">Professor</option>
                  </select>
                </label>
              </>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                required
              />
            </label>

            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
