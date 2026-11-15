# Ritendu workstream hand-off (CMS, permissions, content data)

Branch: `ritendu/cms-b01-b02` · Updated: 15 November 2026 · Detailed status: [`ritendu-progress.md`](ritendu-progress.md)

## What is done

| Item | Files | Status |
|---|---|---|
| B02 access policy (roles, Editor allowlist, last-Admin decision logic) | `src/access/policy.ts`, `tests/access-policy.test.ts`, `docs/access-matrix.md` | **Done, 42 tests run and pass** |
| B02 Users collection (Payload) | `src/collections/Users.ts` | Written, **not run** (needs P01) |
| B02 direct-API permission tests | `tests/permissions.test.ts` | Written, **not run** (skipped unless `PERMISSIONS_TEST=1` and an isolated DB) |
| B01 content contract | `docs/content-contract.md` | **DRAFT**, awaiting reviewer sign-off |
| B06b redirect validation rules | `src/hooks/redirectRules.ts`, `tests/redirect-rules.test.ts` | **Done, 13 tests run and pass** (not yet wired into a Payload collection) |
| B07 relationship safety rules (publish-reference check, public media shaping, delete guard, page-refresh plan, visible hook failures) | `src/hooks/relationshipRules.ts`, `tests/relationships.test.ts` | **Done, 18 tests run and pass** (not yet wired into Payload hooks) |

Editor rule: an Editor can change only their own `displayName` (explicit allowlist). Email, password, role, active status and any other field are denied.

## Known limits (please read)

- **Last-Admin protection is NOT safe yet at the Payload layer.** The decision logic exists, but a count followed by a separate save can race. The required atomic step is in `docs/access-matrix.md` section 7 and needs P01.
- Nothing Payload-based has been compiled or run, because there is no app foundation on `main` yet.
- The content contract is based on Shreyam's draft inventory (PR #5), where nothing is confirmed.

## What is pending from others

| Owner | Needed from them | Unblocks |
|---|---|---|
| **Sourasish** | Merge P01 (app foundation, test script, Payload CLI script). Confirm hooks, `req.transaction` and an advisory lock work with the pinned Payload and Postgres. Review contract sections 1, 6, 8. Decide `payload.config.ts` location and publication-event timing. | All Payload checks, `Users.ts`, last-Admin integration test |
| **Shreyam** | Say whether PR #5 is the final M01 and give the approved source lock. Resolve the `/events/lord-of-the-rings` alias question, group list, duplicate people, which page is the AGV feature and the card order. Review contract sections 2 to 5 and Media fields. | Contract fields leaving PENDING; Projects, Events, People, Milestones |
| **Pritish** | List the public fields each page needs. Agree the Home/About/SiteSettings fields. | Globals, public-field allow-lists |
| **Orchestrator** | Timezone and "upcoming" rule; Redirects Admin-only or draft/publish; allow 410 or not; who may publish; club-owned recovery email; first Admin; portrait consent rule. | Events logic, Redirects, recovery setup |

Review checklist for each person: `docs/content-contract.md` section 10. Open questions 1 to 13: section 9 of the same file.

## What is blocked until sign-off

Projects (B03), Events (B04), People and Memberships (B05), Home/About/SiteSettings (B06a), Milestones and Redirects collections (B06b), relationship hooks (B07), editor guide and e2e (B08). No collection is built on a field that is still PENDING.

## How to review this PR

1. Read `docs/access-matrix.md` (rules and attack cases PERM-01 to PERM-23).
2. Read `docs/content-contract.md` sections 8a, 9 and 10; reply to your checklist items.
3. Policy tests: they need vitest, which main does not have yet. After P01: `pnpm test -- tests/access-policy.test.ts tests/redirect-rules.test.ts`.
