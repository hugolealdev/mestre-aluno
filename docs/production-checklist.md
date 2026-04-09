# Production Checklist

## Supabase

1. Provision PostgreSQL 15+ and copy `DATABASE_URL` and `DIRECT_URL`.
2. Create the private bucket configured in `SUPABASE_STORAGE_BUCKET_PRIVATE`.
3. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `pnpm prisma:migrate` before the first public deployment.

## Render

1. Deploy `apps/api` using [render.yaml](/C:/dev/mestre-aluno/render.yaml).
2. Confirm the health check uses `/api/health`.
3. Inject all production environment variables.
4. The backend startup now runs `prisma migrate deploy` automatically before boot.

## Vercel

1. Deploy `apps/web` using [vercel.json](/C:/dev/mestre-aluno/vercel.json).
2. Set `VITE_API_URL` to `https://<render-api>/api`.
3. Validate login, dashboard, Stripe checkout, and signed downloads against the public API.

## Stripe and Google

1. Create the official Stripe `price_id` values for student, teacher, and verification.
2. Point the Stripe webhook to `https://<render-api>/api/billing/webhook`.
3. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and the `price_id` values.
4. Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, and `GOOGLE_CALENDAR_ID`.
5. Validate lesson purchase, calendar event creation, reschedule sync, and cancellation in public environment.

## Go-Live Gate

1. `NODE_ENV=production`
2. JWT secrets with 32+ characters
3. Public URLs correct in `APP_URL` and `VITE_API_URL`
4. Supabase database reachable from Render
5. Private storage uploads and signed URLs working
6. Stripe webhook returning `200`
7. Render health check returning `ok`
