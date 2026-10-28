# Environment Baseline & Staging Configuration

## 1. Pinned Software Runtime Matrix
- **Node.js LTS**: `20.18.1` (pinned in `.nvmrc`)
- **Package Manager**: `pnpm` (frozen lockfile `pnpm-lock.yaml`)
- **Framework**: Next.js (App Router)
- **Content System**: Payload CMS v3 (embedded in Next.js)
- **Database Adapter**: Managed PostgreSQL (`@payloadcms/db-postgres`)
- **Storage Provider**: S3-compatible managed object storage (direct-to-bucket uploads)

## 2. CI/CD Quality Pipeline
Automated quality checks are enforced via GitHub Actions (`.github/workflows/quality.yml`):
- `pnpm lint` – ESLint code standards check
- `pnpm typecheck` – TypeScript static type validation (`tsc --noEmit`)
- `pnpm test` – Unit & integration testing via Vitest
- `pnpm build` – Next.js production compilation

## 3. Environment Variable Requirements
Required environment variables are validated at build time via `src/env.ts`:
- `DATABASE_URL`: PostgreSQL connection string URI
- `PAYLOAD_SECRET`: Cryptographic secret key (minimum 32 characters)
- `SERVER_URL`: Application canonical URL (`http://localhost:3000` in dev)
