# Team work guide: what to do next

This page says what is ready, what each person can do now, and what to give a coding agent. It is written for the IOTA JU redesign team.

For your immediate task, start with one of these short handouts:

- [Sourasish: app foundation (PDF)](next-steps/sourasish/sourasish-next-steps.pdf) · [LaTeX source](docs/next-steps/sourasish/main.tex)
- [Ritendu: CMS and permissions (PDF)](next-steps/ritendu/ritendu-next-steps.pdf) · [LaTeX source](docs/next-steps/ritendu/main.tex)
- [Shreyam: old-site inventory (PDF)](next-steps/shreyam/shreyam-next-steps.pdf) · [LaTeX source](docs/next-steps/shreyam/main.tex)
- [Pritish: frontend timing (PDF)](next-steps/pritish/pritish-next-steps.pdf) · [LaTeX source](docs/next-steps/pritish/main.tex)

Read your task handbook before coding:

- [Orchestrator guide](../main.tex)
- [Sourasish: platform and release work](assignments/sourasish.pdf) · [editable source](assignments/sourasish.tex)
- [Ritendu: CMS and permissions](assignments/ritendu.pdf) · [editable source](assignments/ritendu.tex)
- [Pritish: design and public pages](assignments/pritish.pdf) · [editable source](assignments/pritish.tex)
- [Shreyam: source inventory and media](assignments/shreyam.pdf) · [editable source](assignments/shreyam.tex)

The words in this guide are simple on purpose. A **PR** is a proposed code change. A **draft** is work that still needs review. A **check** is a command or GitHub action that shows whether the change works.

## Short answer

The project can move forward now. Three people have separate work they can start without waiting for one another:

1. Sourasish can finish the app foundation.
2. Ritendu can finish the first data rules and the basic permission rules.
3. Shreyam can list the old site's pages and files.

Pritish's page-building work can wait. He can prepare design notes later if the team wants that.

Do not treat spoken updates as proof that work is ready. Work is ready for the team when the branch and commit are in GitHub, the PR explains what changed, and the required checks and review are done.

## What the shared repository shows

This is the status checked on 24 October 2026. Check the links again before using this as a fresh status report.

- The shared main branch has the handbooks and planning files. It does not have the app foundation yet.
- [Ritendu's PR #1](https://github.com/Soham-47/iota-ju-next/pull/1) is open. It changes a draft content contract, permission rules and their tests. It is not ready to merge:
  - An Editor can change their own email and other fields that should stay private.
  - The last Admin check can fail if two Admin changes happen at the same time.
  - The test file cannot run from main yet because the app and test setup are not there.
  - The content contract still needs review against Shreyam's source list.
- [PR #2](https://github.com/Soham-47/iota-ju-next/pull/2) is open. Its description says it completes the app base and CI, but its actual changes are only five files: .env.example, next-env.d.ts, package.json, pnpm-lock.yaml and tsconfig.tsbuildinfo. The app routes, Payload setup, server environment check, test setup, CI workflow and environment guide are missing. It is not ready to merge.
- I cannot see unpushed work on a member's computer. If someone says their work is further along, ask for the branch name and latest commit, then check that exact work.
- GitHub says the two member PRs can be combined with main. That only means Git can combine the changes. It does not mean the PR is complete, safe or approved.
- Neither member PR currently reports a passing check.

The PR author of #2 is shown as A-spark-of-fire. The PR text says it is Sourasish's work. Confirm that this is Sourasish's GitHub account and record the match in the team notes.

## What you should do as the orchestrator

Do these steps first:

1. Ask each member to confirm their full name, GitHub login, task ID, branch and latest commit.
2. Ask for a short status using the form below. Give everyone until the next team check-in, or set a 24-hour reply time if you need to restart work quickly.
3. Tell Sourasish, Ritendu and Shreyam to start the separate tasks listed below. Tell them they do not need to wait for one another to start those tasks.
4. Ask for one exact missing item when someone says “I am blocked.” For example: “I need the agreed Project fields from Ritendu.” Do not accept “waiting for backend” as a blocker by itself.
5. Keep paid hosting, database and storage setup on hold until you approve the account owner and budget. Local code, source review and GitHub CI do not need that approval.
6. Review and merge one small PR at a time. Update the team status after each merge.

You can copy this message to the team:

~~~text
We are restarting the IOTA JU Next work from the shared repository.

Please reply before our next check-in with:
Name and GitHub login:
Task ID:
Branch and latest commit:
What is done:
What is the next small PR:
Blocked by (name the exact missing file or decision and its owner):
Checks run and their real results:
Work that is done locally but not pushed:

Start these tasks now:
- Sourasish: P01 app foundation.
- Ritendu: B01 draft content contract and B02 permission fixes.
- Shreyam: M01 source inventory.

You can start these tasks in parallel. Do not wait for the app, final page design, cloud account or another task unless the guide names it as a real blocker. Do not spend money or change production.
~~~

Use this status form at every check-in:

~~~text
Name:
Task ID:
Status: not started / working / ready for review / blocked / done
Branch and latest commit:
Done since last update:
Next small deliverable:
Blocked by: exact item + owner, or “none”
Checks and evidence:
Decision needed from the orchestrator:
~~~

## Who owns what

| Person | Main work | Can start now |
|---|---|---|
| Sourasish | App setup, shared tools, CI, public data readers, preview and release work | P01: app foundation |
| Ritendu | CMS records, roles, permissions, database changes and editor guide | B01 draft and safe B02 permission rules |
| Shreyam | Old-site inventory, media, imports and migration checks | M01: source inventory |
| Pritish | Design and public pages | Can wait; F01 design notes are optional for now |
| You | Scope, decisions, review order, account/budget approval and release approval | Confirm people, source version and status |

The handbooks use the task prefixes P, B, F and M. P means platform, B means CMS/backend, F means frontend, and M means moving the old site's content and media.

## Work that can happen now

### Sourasish: finish P01, the app foundation

P01 does not need final design, final content fields, a database account or paid hosting. Build the small, working app base first. Keep P02 CI in a separate follow-up once the command names are stable. CI means automatic checks that GitHub runs for a PR.

The current PR #2 is not the complete P01/P02 work described in its title. Sourasish should either finish it with the missing files or replace it with a focused P01 PR. Do not merge the current version.

Expected P01 work:

- Add a working Next.js app with Payload and its PostgreSQL adapter.
- Add the Payload admin/API route files and the first Payload config.
- Add the pinned Node version, package manifest, matching lockfile and needed app configuration.
- Add a server-side check for required environment values and a safe .env.example.
- Add the promised scripts and test setup. Every script must have the tool it runs installed.
- Keep the existing handbooks, main.tex, README and Git history.
- Do not commit generated build files such as tsconfig.tsbuildinfo.
- Check the selected package versions against the official setup instructions and write down the versions used.

P01 is ready for review when a second person can start from a fresh clone and run the lockfile install, lint, type check, tests and build using the documented commands. List exactly which commands were run and their results. Do not claim a check passed unless it ran and passed.

After P01:

- Add the GitHub quality workflow and environment guide as P02.
- CI can run without buying a cloud service.
- Staging setup waits for your approval of the provider, owner and budget.

### Ritendu: finish B01 and make B02 safe

Ritendu can work before the full CMS exists. Keep B01 marked DRAFT until Shreyam's source list and the other owners have reviewed it.

For B01, write down:

- The fields for Project, Event, Person, Membership, Media and shared site settings.
- Which fields visitors may see and which fields stay private.
- Stable source IDs, URL slugs and display order.
- The difference between “draft/published” and “ongoing/completed/cancelled.”
- Dates exactly as known. Leave unknown dates unknown.
- Questions that need an answer from Shreyam, Sourasish, Pritish or the orchestrator.

For B02, fix the problems in PR #1:

- Let an Editor change only the approved self-service field, their own display name. Password changes must use the proper account recovery flow.
- Add a check that rejects an Editor changing their own email, role or active status.
- Keep at least one active Admin. A simple “count Admins, then save” check is not enough: two requests at once could both pass. When Payload is ready, protect the count and change as one safe operation and test it there.
- Keep the role rules on the server. Hiding a button in the admin page is not enough.
- Do not say the tests passed while there is no test runner on main. After P01 lands, run the tests and report the actual result.

Do not start B03 collection work until P01 is merged and the minimum Project and Media fields have been agreed. You can finish the draft contract and pure permission rules before that.

### Shreyam: start M01, the old-site inventory

M01 does not need the new app. Work from the old website repository. Record the exact commit you inspect so everyone knows which copy of the old site you checked.

Create a readable report and a machine-readable list. For every public page, old URL, text block and image/video/PDF, record:

- Where it is in the old repository.
- What page or feature uses it.
- Its exact file name and letter case.
- For media: file type, size and checksum.
- What should happen: migrate, redirect, keep on the old site or exclude.
- Any question about a name, date, identity, link or missing file.

Do not merge people just because their names look alike. Do not invent missing information. Do not copy large original media into the new Git repository. Mark the workshop Q&A as excluded from the new site, but do not delete the old service or its data.

M01 is ready when another person can follow the list back to the old site, and running the inventory twice on the same commit gives the same result. Write down anything you could not confirm.

After M01, Shreyam can prepare image/video delivery copies under M03 without waiting for the CMS. Do not upload them to paid storage until the provider and budget are approved.

### Pritish: hold page coding for now

Pritish does not need to block the backend work. He can wait to build public pages until P01, the minimum content fields and the public data readers are ready. If useful, he may prepare the F01 design notes, but the team can restart backend work without them.

## Simple dependency map

A dependency is a real earlier result that another task needs. It is not a reason to stop all work.

~~~text
START NOW, IN PARALLEL
Sourasish: P01 app base
Ritendu: B01 draft + B02 permission fixes
Shreyam: M01 old-site inventory

AFTER P01
Sourasish: P02 CI
Ritendu: Payload user roles and collections
Shreyam: M02 storage work, after provider and budget approval

AFTER M01
Ritendu: finish B01 using real source facts
Shreyam: M03 prepare delivery media; later M04 sample import

AFTER P01 + agreed B01 + safe B02 + Media fields
Ritendu: B03 Project record
Sourasish: P03 public Project reader
Shreyam: M04 sample import, after B03 and safe staging exist
Pritish: F03 project pages, when the reader and imported sample are ready
~~~

If the needed task has not finished but a person can still make a useful draft, use a small example and label what is assumed. Do not guess a final field name or build on it as if the team approved it.

## Copy these instructions into a coding agent

Give an agent only the prompt for its assigned task. The agent must read the linked handbook and inspect the current branch before it changes files.

### Prompt for Sourasish: P01 app foundation

~~~text
You are working on the IOTA JU website redesign in Soham-47/iota-ju-next.

First read README.md, docs/coordination-plan.md and the Sourasish handbook in docs/assignments/sourasish.pdf or .tex. Inspect the current main branch and keep all existing handbooks and planning files.

Your task is P01 only: make the smallest complete, working Next.js and Payload app foundation. Do not build public pages, choose a cloud provider, create paid services or implement later P tasks.

Add the files P01 needs: the app and Payload routes/config, pinned Node and package versions, package manifest and lockfile, TypeScript/Next configuration, server environment validation, safe .env.example, required scripts and the initial test setup. Use the official setup instructions to check that the selected Next, Payload, React and Node versions work together. Do not add duplicate tools or a second backend.

Keep the package scripts honest: every command must have its required package installed. Do not commit generated build output such as tsconfig.tsbuildinfo. Preserve README.md, main.tex, docs/ and Git history.

Before finishing, verify from a fresh clone or a clean working copy that the documented install, lint, type check, tests and build work. Report each command and its real result. If a check cannot run, say why and leave it marked as not checked.

Open a focused P01 pull request. In the PR, list the task ID, files changed, versions selected, checks run, results and anything still blocked. Stop after P01. Do not call P02 complete until its workflow and environment guide are also present.
~~~

### Prompt for Ritendu: B01 draft and B02 permission fixes

~~~text
You are working on the IOTA JU website redesign in Soham-47/iota-ju-next.

First read README.md, docs/coordination-plan.md and the Ritendu handbook in docs/assignments/ritendu.pdf or .tex. Inspect PR #1 and its latest commit before changing anything. Do not assume work on another computer is in GitHub.

Your task is to finish the current B01 draft and fix B02 permission problems. Keep each change small. If B01 and B02 become hard to review together, make separate focused PRs. Do not start B03 collections yet.

For B01:
- Keep the contract marked DRAFT until Shreyam's source list and the owners have reviewed it.
- List proposed fields for Project, Event, Person, Membership, Media and shared settings.
- Mark each public field and private field.
- Keep stable source IDs, URL slugs, display order, publication state and project/event lifecycle separate.
- Leave unknown dates, identities and links as questions. Name the person who can answer each question.

For B02:
- Let Editors change only their own approved display-name field. Password changes use the intended account recovery flow.
- Reject an Editor changing their email, role or active status, and add focused tests.
- Keep at least one active Admin. A count followed by a separate write can fail when two requests happen at once. Do not claim this is fully protected until the Payload integration makes the check and write safe together.
- Enforce permissions on the server, not only by hiding admin buttons.

Do not add packages or edit shared root setup. The test runner may not exist on main yet. Do not claim tests passed unless you ran them; after P01 is merged, run the focused tests and report the results.

Open or update a focused PR with the B01/B02 task ID, changed files, checks actually run, pending source questions and remaining blockers. Stop before B03.
~~~

### Prompt for Shreyam: M01 old-site inventory

~~~text
You are working on the IOTA JU website redesign. Read README.md, docs/coordination-plan.md and the Shreyam handbook in docs/assignments/shreyam.pdf or .tex.

Your task is M01: record what the current public website contains. This task can start without the new app. First confirm the exact source repository and commit with the orchestrator, then inspect that version. Do not change or delete the old website.

Create:
1. docs/source-inventory.md for people to read.
2. A machine-readable manifest that another tool can use later.

List every public page and old public URL, and each text, image, video, PDF or external embed used by those pages. Record the old path, exact file-name case, page use, file type and size. For media, record a checksum. Mark each item migrate, redirect, keep on the old site or exclude, and give the reason.

Flag uncertain dates, names, identities, links and missing files for the owner to answer. Do not merge same-name people automatically. Do not invent information. Exclude workshop Q&A from the new site, but leave its old service and data untouched. Do not copy large media into the new Git repository or upload it to a paid service.

Run the inventory twice against the same source commit and compare the output. Manually trace at least one item from each public section plus the linked AGV/history pages. Report the source commit, files created, checks actually run, questions and blockers. Open a focused M01 PR and stop before M02 or M04.
~~~

## How PRs should be handled

Before merging a PR, check all of these:

- The PR does one named task and follows the file ownership above.
- The changed files match what the PR says it does.
- The required checks passed, or the PR clearly says which checks still cannot run and why.
- A person who owns the affected area reviewed it.
- The PR does not add secrets, paid services, production data or unrelated features.
- Any database change has a reviewed migration and a safe apply plan.

Merge only after these items are true. “Mergeable” on GitHub only means the branch can be combined with main.

### Plain-language review of Ritendu's PR #1

**Decision: do not merge yet.**

Please fix these items:

1. Editors must not be able to change their email, role or active status. Let them change only the approved name field. Add a test that proves the other changes are denied.
2. The last active Admin must be protected even when two changes happen at once. The current count check alone does not prove that. Add the safe Payload-side check when P01 is ready, and keep the integration check on the follow-up list.
3. Keep the content contract marked DRAFT until M01 and the owners review it.
4. Do not say the tests pass until there is a test setup and the tests have actually run.

### Plain-language review of PR #2

**Decision: do not merge yet.**

The PR says it adds the app and CI, but the shared diff has only five files. The working app, Payload routes and config, required packages, environment check, test setup, CI workflow and environment guide are missing.

Please confirm whether the PR is incomplete or whether more work is on another branch. Then push a complete P01 change, remove the generated tsconfig.tsbuildinfo file, make the lockfile match package.json, and report the commands and results from a clean checkout. CI does not need a cloud provider. Wait for approval before creating paid staging resources.

## What the first complete demo should prove

Do not build every page before one real project works from start to finish. Use TemperLink for the first example:

1. Shreyam's import starts in preview mode and does not overwrite editor changes.
2. An Editor saves a draft.
3. The private preview shows that draft. A signed-out visitor cannot read it.
4. An Admin publishes it.
5. The public site shows only approved fields on the project list, detail page and home teaser.
6. The project media and report link work.
7. GitHub checks pass on the merged branch.

This demo needs P01, the agreed Project and Media fields, B02/B03, M01/M02/M03/M04, P03/P05 and Pritish's F03 page. Work toward it in small steps; it is not a reason to block P01, B01, B02 or M01.

Keep the old website available until the new site passes the release checks. The workshop Q&A stays outside the new app.
