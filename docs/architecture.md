# Arquitetura

## Visão geral

- `apps/api`: centro da verdade para auth, dados, pagamentos e integrações.
- `apps/web`: landing pública e shell autenticado consumindo a API real.

## Infraestrutura

- GitHub como fonte única do código
- Supabase para PostgreSQL e storage privado
- Render para backend
- Vercel para frontend

## Regras

- Zero mock em fluxo principal
- Compatibilidade com Windows e macOS
- Segurança orientada por JWT, guards e storage privado

