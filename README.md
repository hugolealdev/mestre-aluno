# Mestre Aluno

Monorepo oficial da plataforma Mestre Aluno.

- `apps/api`: NestJS 10 + Prisma 5 + PostgreSQL/Supabase
- `apps/web`: React 18 + Vite + TypeScript + Tailwind
- `docs`: arquitetura e setup cloud

## Infraestrutura oficial

- GitHub
- Supabase
- Render
- Vercel
- Stripe

## Primeiros passos

1. Copie `./.env.example` para os ambientes locais necessários.
2. Instale dependências com `pnpm install`.
3. Gere o Prisma Client com `pnpm prisma:generate`.
4. Aplique migrations com `pnpm prisma:migrate`.
5. Rode localmente com `pnpm dev`.

Nunca commite segredos reais.

## Producao

- Backend no Render com [render.yaml](/C:/dev/mestre-aluno/render.yaml)
- Frontend no Vercel com [vercel.json](/C:/dev/mestre-aluno/vercel.json)
- Banco e storage privados no Supabase
- Em producao, Stripe e Google Calendar/Meet sao obrigatorios e validados pelo schema de ambiente
- O start da API executa `prisma migrate deploy` automaticamente antes de subir
- Checklist operacional em [production-checklist.md](/C:/dev/mestre-aluno/docs/production-checklist.md)
