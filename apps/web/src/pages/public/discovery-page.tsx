import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

type DiscoveryTeacher = {
  id: string;
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  isVerified: boolean;
  teacherProfile?: {
    publicSlug: string;
    specialties: string[];
    publicBasePrice?: number | string | null;
  } | null;
};

type DiscoveryContent = {
  id: string;
  title: string;
  preview: string;
  priceAmount: number | string;
  teacher: {
    fullName: string;
    teacherProfile?: {
      publicSlug: string;
      specialties: string[];
    } | null;
  };
};

type DiscoveryResponse = {
  teachers: DiscoveryTeacher[];
  contents: DiscoveryContent[];
};

export function DiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [submittedCity, setSubmittedCity] = useState('');

  const discoveryQuery = useQuery({
    queryKey: ['discovery', submittedSearch, submittedCity],
    queryFn: async () =>
      apiRequest<DiscoveryResponse>(
        `/discovery/search?q=${encodeURIComponent(submittedSearch)}&city=${encodeURIComponent(submittedCity)}`
      )
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchTerm);
    setSubmittedCity(city);
  }

  return (
    <main className="container-shell py-16">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Descoberta</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
          Encontre professores e conteúdos por matéria, assunto ou cidade.
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ex.: matemática, redação, inglês"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Cidade"
            className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-950">Professores</h2>
          <p className="text-sm text-slate-500">{discoveryQuery.data?.teachers.length ?? 0} resultados</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {discoveryQuery.data?.teachers.map((teacher) => (
            <Link
              key={teacher.id}
              to={`/professores/${teacher.teacherProfile?.publicSlug}`}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-slate-950">{teacher.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {teacher.city ?? 'Cidade não informada'} {teacher.isVerified ? '• Verificado' : ''}
                  </p>
                </div>
                <p className="text-sm font-semibold text-blue-700">
                  {teacher.teacherProfile?.publicBasePrice
                    ? `R$ ${Number(teacher.teacherProfile.publicBasePrice).toFixed(2)}`
                    : 'Preço sob consulta'}
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {teacher.headline ?? teacher.bio ?? 'Professor com perfil público ativo na plataforma.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {teacher.teacherProfile?.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </Link>
          ))}
          {!discoveryQuery.data?.teachers.length ? (
            <p className="text-sm text-slate-500">Nenhum professor encontrado ainda.</p>
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-950">Conteúdos</h2>
          <p className="text-sm text-slate-500">{discoveryQuery.data?.contents.length ?? 0} resultados</p>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {discoveryQuery.data?.contents.map((content) => (
            <div key={content.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xl font-semibold text-slate-950">{content.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{content.preview}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">{content.teacher.fullName}</p>
                <p className="text-sm font-semibold text-blue-700">
                  R$ {Number(content.priceAmount).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {!discoveryQuery.data?.contents.length ? (
            <p className="text-sm text-slate-500">Nenhum conteúdo encontrado ainda.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

