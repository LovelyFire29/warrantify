# Warrantify

Warrantify is a household warranty and device management app. Register the electronics and
appliances you own, and Warrantify tracks warranty status automatically, stores invoices and
warranty documents, sends expiry reminders, and keeps a record of repair claims.

## Tech stack

- [React 19](https://react.dev/) with [TanStack Start](https://tanstack.com/start) and
  [TanStack Router](https://tanstack.com/router) for routing and SSR
- [Vite](https://vitejs.dev/) as the build tool, deployed to [Vercel](https://vercel.com/) via
  [Nitro](https://nitro.build/)
- [Tailwind CSS v4](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- [Supabase](https://supabase.com/) for Postgres, authentication, and row-level security
- [Framer Motion](https://www.framer.com/motion/) for animation

## Development

You'll need [Bun](https://bun.sh/) installed.

```sh
git clone <this-repository-url>
cd warrantify
bun install
cp .env.example .env   # then fill in your Supabase project's values
bun run dev
```

The dev server runs at `http://localhost:8080`.

### Other scripts

```sh
bun run build       # production build (Vercel Build Output in .vercel/output)
bun run lint        # run eslint
bun run format      # run prettier
```

To smoke-test a production build locally, build for plain Node instead (`vite preview` doesn't
work with Nitro output):

```sh
NITRO_PRESET=node-server bun run build
PORT=8080 node .output/server/index.mjs
```

## Deployment

The app deploys to [Vercel](https://vercel.com/); Nitro picks the Vercel preset automatically there.

1. Import the repository in Vercel (or run `vercel` from the project root).
2. Under Project Settings → Environment Variables, set `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase → Authentication → URL Configuration, set the Site URL to your production domain and
   add `https://<your-domain>/**` to Redirect URLs. Google sign-in returns users there.

## Environment variables

See `.env.example` for the full list. At minimum you need a Supabase project's URL and
publishable key (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Server-side code
additionally uses `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` — keep these out of client bundles
and never commit them.

## Database

Supabase migrations live in `supabase/migrations`. The schema covers `devices`, `warranties`,
`documents`, `service_history`, `claims`, and `notifications`, each scoped to the owning user via
row-level security policies.
