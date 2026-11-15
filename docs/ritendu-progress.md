# Ritendu workstream progress
Remote: https://github.com/sarkarritendu-creator/iota-ju-next.git   Branch: ritendu/cms-b01-b02   Updated: 2026-11-15
Last commit: (set after N0 commit)
Status: STOPPED AT CHECKPOINT

## Nodes
N0 DONE | N1 DONE (U1 existing from PR #1; U2 policy tested, Users.ts NOT RUN; U3 NOT RUN; U4 documented, concurrency test NOT RUN, rule NOT SAFE at Payload layer) | N2 DONE (U1 DONE: existing PR #1 contract checked against handbook, DRAFT label, PENDING marks, sign-off table present; U2 DONE (reconciled vs draft PR #5 inventory; nothing Confirmed, PENDING marks kept); U3 DONE) | N3, N4, N5, N6 BLOCKED (no B01 sign-off; fields PENDING) | N7 IN PROGRESS (U1 DONE: src/hooks/redirectRules.ts + tests/redirect-rules.test.ts, 13 tests run and passing; Redirects.ts collection, Milestones, hook wiring PENDING sign-off/P01) | N8 BLOCKED | N9 PENDING | N10 PENDING

## NEXT UNIT: N8-U1 (field-independent relationship/deletion guard logic as pure functions + tests, same approach as redirectRules). Then N10 interim report. N3-N6 and Redirects/Milestones collections wait for B01 sign-off (docs/content-contract.md section 9)

## Not run / unverified
- Redirect hook wiring into a Payload Redirects collection: not written (needs sign-off + P01). Pure logic IS tested (13 passing).
- Last-Admin atomic protection: policy doc'd (access-matrix.md section 7); NOT implemented at Payload layer; concurrency test written, NOT RUN
- tests/permissions.test.ts: skipped without PERMISSIONS_TEST=1 + isolated DB; needs P01; never executed
- src/collections/Users.ts: written for Payload 3.x, never compiled or run (Payload not installed on this branch)
- Payload-based checks and direct-API tests: NOT RUN, waiting for P01 (no app/Payload on main; PR #2 incomplete)
- Policy unit tests run with an out-of-repo vitest (node_modules symlink, gitignored); no test setup is committed on main

## Open questions (owner)
- Contract questions 10 to 13 added (final M01/source lock; lord-of-the-rings alias; portrait consent and same-name people; AGV and card order) : see docs/content-contract.md section 9
- Redirects Admin-only (proposed) or draft/publish? : orchestrator
- Editor media upload directly or pre-approved only? : Shreyam / orchestrator
- Who is first Admin and who receives recovery email? : orchestrator
- Remote: team docs use Soham-47/iota-ju-next; this clone is sarkarritendu-creator/iota-ju-next (same main commit d22b470) : user to confirm

## Requests to others
- Sourasish: confirm hooks + req.transaction + advisory lock work on pinned Payload/Postgres (access-matrix.md s.7)
- Sourasish: P01 foundation + test script + Payload CLI script before Payload checks can run
- Shreyam: M01 source inventory before B01 PENDING fields can be resolved

## Notes / decisions
- Team-facing summary and pending-from-others table: docs/ritendu-handoff.md (PR description draft kept outside the repo)
- N2-U2 plan: reconcile every PENDING M01 field in docs/content-contract.md against Shreyam's docs/source-inventory.md (+ data/migration/source-manifest.json), available only on unmerged PR #5 (git ref pr5, fetch: git fetch https://github.com/Soham-47/iota-ju-next.git refs/pull/5/head:pr5). Treat it as DRAFT input, not agreed. Add open question #10: confirm PR #5 inventory is the final M01.
- Local sandbox clone had no push access; work is saved as a git bundle + patches (see continuation prompt)
- Branch based on main (d22b470); PR #1 files (policy.ts, access-policy test, access-matrix.md, content-contract.md) brought in from commit 0f19204 without its README/doc deletions (PR #1 was based on an older main)
- PR #1 baseline: 36/36 policy tests pass
