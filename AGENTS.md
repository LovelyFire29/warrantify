# Agent notes

- Package manager: bun (`bun install`, `bun run dev`, `bun run build`).
- Stack: TanStack Start (React) + Vite, Tailwind CSS v4, Supabase (Postgres, Auth, RLS).
- Environment variables live in `.env` — see `.env.example` for the required keys.
- Deploys to Vercel via Nitro (`vite build` writes the Vercel Build Output to `.vercel/output`).
