# Unblock implementation and keep work in sync

This plan separates work that can start now from work that truly needs an upstream deliverable. The assignments in [docs/assignments/](assignments/) remain the detailed source of scope. This page makes the handoffs explicit.

## Verified starting point

As of 24 October 2026, `main` contains the handbooks but not the application scaffold. [PR #2](https://github.com/Soham-47/iota-ju-next/pull/2) is the P01/P02 proposal from `A-spark-of-fire`; the PR description identifies the Sourasish workstream, but the account-to-member mapping still needs to be recorded. Its current diff does not include the required scaffold or CI, so Sourasish's P01 is **not complete in the shared repository**. This does not tell us whether there is unpushed local work: ask for the branch and commit if the author says more is done.

[Ritendu's PR #1](https://github.com/Soham-47/iota-ju-next/pull/1) contains a draft B01 content contract and B02 access policy. It has requested changes that still need to be addressed. Neither PR has reported commit status checks. Recheck these links before using this snapshot as a status report.

A task is complete for the team when its deliverable is pushed to a reviewable PR, its acceptance evidence is attached, and the required owner review is resolved. A verbal update alone is not a handoff.

## Work that can start in parallel

| Owner | Start now | True blocker | Handoff |
|---|---|---|---|
| Sourasish — P01 foundation | Complete the reproducible app base on the current `main`: Next/Payload/Postgres dependencies, route/config files, Node and package pins, env validation, and scripts. Keep the work independent of the final content schema. | None for P01. Cloud staging and paid services are not part of this start-now task. | A clean clone can install from the lockfile, run the documented checks, and start the app. Record exact versions and commands. |
| Sourasish — P02 CI | Add the quality workflow after the P01 script names are stable. CI can run without a Vercel, database or storage purchase. | Provider approval blocks deployment setup only, not CI. | A PR run reports install, lint, typecheck, tests and build. Document any check that needs staging separately. |
| Ritendu — B01 contract | Continue the contract as a clearly marked draft. Review fields against existing source knowledge and list each decision M01 must confirm. Agree the minimum Project/Media interface with Sourasish and Shreyam. | M01 blocks only final sign-off on source-dependent fields, not drafting. | A reviewed contract with accepted fields, pending source questions, publication rules and public/private field boundaries. |
| Ritendu — B02 policy | Fix the pure policy and unit tests now; the policy is separable from Payload. Use an explicit Editor self-service allowlist and protect the last Admin invariant. | P01 and B01 block Payload access wrappers and direct-API integration checks, not policy design. | Unit tests pass after P01 adds the test runner; later, direct Payload API tests prove the role matrix. |
| Shreyam — M01 inventory | Start against the existing website repository immediately. Record the exact source commit, routes/detail pages, content counts, media paths and checksums, and unresolved identity/date/link questions. | No dependency on the new app, CMS schema, cloud storage or P02. | A versioned inventory and owner-review list; preserve originals and do not copy large media archives into this repo. |
| Shreyam — M03 preparation | Identify candidate delivery files, inspect dimensions/durations, and prepare a checksum/rendition plan after M01 locates the sources. | Storage upload waits for M02/provider approval; local inventory and derivative preparation do not. | Originals remain unchanged; proposed renditions and unsupported files are reported. |
| Pritish — F01 only | The visual direction and page requirements can be drafted from the current site and M01 evidence. | Final page implementation waits for P01 and the agreed B01 fields. | An approved visual specification; no production page work is required to unblock the backend. |

## Real dependency order

```text
P01 foundation ───────────┬──> B02 Payload integration
                          ├──> B03 collection implementation
                          └──> P02 CI workflow

M01 source inventory ─────────> B01 final contract review
             └────────────────> M04 imports

B01 agreed Project/Media interface ──> B03 + P03 + M02 implementation
B02 + P01 + B01 ─────────────────────> authorized draft/publish flow
M02 + M03 + B03 + protected staging ─> M04 sample import
M04 + P03 + F03 ────────────────────> first end-to-end project demo
```

Treat these as **hard dependencies** only where the consumer needs a real runtime or frozen interface. If an upstream task is not needed for a task's current artifact, use a fixture and label the assumption; do not wait for the whole upstream workstream. For example, Ritendu can write pure policy tests before Payload wrappers exist, and Shreyam can inventory media before storage is chosen.

Keep external approvals separate: provider, region, account owner and budget approval are required before provisioning paid services. They do not block source inventory, contract review, local code, or CI.

## Immediate PR sequence

1. **Sourasish:** revise PR #2 or replace it with a complete P01 PR. The current PR is not merge-ready: it lacks the app/config/routes, environment validator, test setup and CI described in its title/body. Do not commit generated TypeScript build metadata. Verify the lockfile from the final `package.json` in a clean clone.
2. **Ritendu:** keep PR #1 marked draft for B01 until M01 questions are answered. Resolve the requested B02 fixes: allow only approved self-service fields; ensure concurrent Admin changes cannot remove the last active Admin. Rebase after P01 so the tests run in the actual project.
3. **Shreyam:** publish the M01 inventory as its own focused PR, independent of PR #2 and PR #1. Flag only the fields that actually need a decision; do not hold all CMS design for a few unknown source facts.
4. **Orchestrator:** confirm the GitHub login for each member, record the source commit M01 inventories, approve the minimum B01 Project/Media contract, and decide provider/budget before anyone provisions staging or storage.

Merge P01 before Payload-specific B02 integration. Merge B01 only after the relevant owners accept the contract. Keep migrations serialized under Ritendu's ownership and root package/CI changes under Sourasish's ownership.

## First integration gate

After P01, the minimum B01 Project/Media interface, B02, M01 and a protected staging environment are ready, complete one real project slice (TemperLink is the specified sample):

- import is a dry run by default and does not overwrite later editor changes;
- an Editor saves a draft, an authorized preview shows it, and the live version remains unchanged;
- an Admin publishes it; the public reader returns only approved published fields;
- list, detail and home teaser refresh; signed-out draft and private-media requests are denied;
- the real report/video reference works, and CI plus the focused tests pass.

Do not expand to every route before this merged-staging flow works. Keep the legacy website available for rollback; the workshop Q&A remains outside this application.

## Lightweight sync

Until the first integration gate, hold a 15-minute sync twice a week. Each owner updates their task PR before the meeting using:

```text
Task ID / owner:
Branch and latest commit:
Done since last update:
Next reviewable deliverable:
Blocked by (exact artifact or decision, and owner):
Evidence / check result:
```

A blocker must name the missing artifact or decision and the person who can provide it. If a task can progress against the agreed draft contract or a fixture, continue and record the assumption. Keep one owner per task, one focused PR per task ID, and the branch based on current `main`; rebase after required upstream merges.
