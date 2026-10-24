# Environment and CI baseline

## Runtime

- Node.js `20.18.1` is pinned in `.nvmrc`.
- pnpm `12.15.0` is pinned in `package.json`.
- The application uses the Next.js App Router and embeds Payload CMS v3.
- Payload stores content in PostgreSQL through `@payloadcms/db-postgres`.

## Local environment

Copy `.env.example` to `.env.local` and replace the placeholder database URL and secret.

| Variable | Purpose | Requirement |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://` or `postgresql://` URL |
| `PAYLOAD_SECRET` | Payload signing/encryption secret | At least 32 characters; keep private |
| `SERVER_URL` | Canonical application origin | Valid URL; defaults to `http://localhost:3000` |

Do not commit `.env.local`, real credentials, or production secrets. CI uses disposable placeholder values only to compile the application; it does not provision a database or paid staging services.

## Quality workflow

The GitHub Actions workflow in `.github/workflows/quality.yml` installs the frozen lockfile and runs the typecheck, ESLint, unit tests, and production build on pushes and pull requests. No provider or cloud-account credentials are required for these checks.
