# Setup Cloud

## Supabase

1. Configurar `DATABASE_URL` e `DIRECT_URL`.
2. Criar bucket privado para arquivos pagos.
3. Aplicar migrations do Prisma.

## Render

1. Conectar o repositório.
2. Publicar `apps/api`.
3. Injetar variáveis de ambiente.

## Vercel

1. Conectar o repositório.
2. Publicar `apps/web`.
3. Definir `VITE_API_URL`.

## Stripe e Google

Configurar preços, webhook Stripe e credenciais Google Calendar/Meet via env vars.
