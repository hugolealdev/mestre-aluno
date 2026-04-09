import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

type PublicTeacherProfile = {
  id: string;
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  isVerified: boolean;
  teacherProfile: {
    publicSlug: string;
    specialties: string[];
    averageRating: number | string;
    totalReviews: number;
    totalLessons: number;
    publicBasePrice?: number | string | null;
  } | null;
  teacherAvailabilities: Array<{
    id: string;
    weekday: number;
    startTime: string;
    endTime: string;
  }>;
  publishedContents: Array<{
    id: string;
    title: string;
    preview: string;
    priceAmount: number | string;
  }>;
};

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function TeacherProfilePage() {
  const { publicSlug } = useParams<{ publicSlug: string }>();

  const profileQuery = useQuery({
    queryKey: ['public-teacher', publicSlug],
    queryFn: async () =>
      apiRequest<PublicTeacherProfile>(`/discovery/teachers/${encodeURIComponent(publicSlug ?? '')}`),
    enabled: Boolean(publicSlug)
  });

  const teacher = profileQuery.data;

  return (
    <main className="container-shell py-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <Link to="/descobrir" className="text-sm font-semibold text-blue-700">
          Voltar para descoberta
        </Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          {teacher?.fullName ?? 'Carregando professor...'}
        </h1>
        <p className="mt-3 text-base leading-8 text-slate-600">
          {teacher?.headline ?? teacher?.bio ?? 'Perfil público do professor na plataforma.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {teacher?.teacherProfile?.specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {specialty}
            </span>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Cidade</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {teacher?.city ?? 'Não informada'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Verificação</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {teacher?.isVerified ? 'Verificado' : 'Sem selo'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Aulas</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {teacher?.teacherProfile?.totalLessons ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Preço base</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {teacher?.teacherProfile?.publicBasePrice
                ? `R$ ${Number(teacher.teacherProfile.publicBasePrice).toFixed(2)}`
                : 'Sob consulta'}
            </p>
          </div>
        </div>
        {teacher ? (
          <div className="mt-6">
            <Link
              to={`/auth?redirect=${encodeURIComponent(`/painel?teacherId=${teacher.id}&teacherSlug=${teacher.teacherProfile?.publicSlug ?? ''}`)}`}
              className="inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Agendar com este professor
            </Link>
          </div>
        ) : null}
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Disponibilidade</h2>
          <div className="mt-5 space-y-3">
            {teacher?.teacherAvailabilities.map((slot) => (
              <div key={slot.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{weekdayLabels[slot.weekday]}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {slot.startTime} até {slot.endTime}
                </p>
              </div>
            ))}
            {!teacher?.teacherAvailabilities.length ? (
              <p className="text-sm text-slate-500">Professor ainda não publicou disponibilidade.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-950">Conteúdos publicados</h2>
          <div className="mt-5 space-y-3">
            {teacher?.publishedContents.map((content) => (
              <div key={content.id} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{content.title}</p>
                <p className="mt-1 text-sm text-slate-600">{content.preview}</p>
                <p className="mt-3 text-sm font-semibold text-blue-700">
                  R$ {Number(content.priceAmount).toFixed(2)}
                </p>
              </div>
            ))}
            {!teacher?.publishedContents.length ? (
              <p className="text-sm text-slate-500">Professor ainda não publicou conteúdos.</p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
