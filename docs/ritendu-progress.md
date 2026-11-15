# Ritendu workstream progress
Remote: https://github.com/sarkarritendu-creator/iota-ju-next.git   Branch: ritendu/cms-b01-b02   Updated: 2026-11-15
Last commit: (set after N0 commit)
Status: IN PROGRESS

## Nodes
N0 DONE | N1 IN PROGRESS (U1 DONE (existing from PR #1, verified), U2 DONE (policy tested; Users.ts NOT RUN), U3 DONE (tests written, NOT RUN), U4 PENDING) | N2 PENDING | N3 PENDING | N4 PENDING | N5 PENDING | N6 PENDING | N7 PENDING | N8 PENDING | N9 PENDING | N10 PENDING

## NEXT UNIT: N1-U4

## Not run / unverified
- tests/permissions.test.ts: skipped without PERMISSIONS_TEST=1 + isolated DB; needs P01; never executed
- src/collections/Users.ts: written for Payload 3.x, never compiled or run (Payload not installed on this branch)
- Payload-based checks and direct-API tests: NOT RUN, waiting for P01 (no app/Payload on main; PR #2 incomplete)
- Policy unit tests run with an out-of-repo vitest (node_modules symlink, gitignored); no test setup is committed on main

## Open questions (owner)
- Redirects Admin-only (proposed) or draft/publish? : orchestrator
- Editor media upload directly or pre-approved only? : Shreyam / orchestrator
- Who is first Admin and who receives recovery email? : orchestrator
- Remote: team docs use Soham-47/iota-ju-next; this clone is sarkarritendu-creator/iota-ju-next (same main commit d22b470) : user to confirm

## Requests to others
- Sourasish: P01 foundation + test script + Payload CLI script before Payload checks can run
- Shreyam: M01 source inventory before B01 PENDING fields can be resolved

## Notes / decisions
- Branch based on main (d22b470); PR #1 files (policy.ts, access-policy test, access-matrix.md, content-contract.md) brought in from commit 0f19204 without its README/doc deletions (PR #1 was based on an older main)
- PR #1 baseline: 36/36 policy tests pass
