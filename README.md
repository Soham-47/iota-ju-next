# IOTA JU new website

This repository holds the plan and code for the new IOTA JU website. The old website stays available until the new one is ready.

## Current status

The main branch has the project handbooks and planning files. The app has not been added to main yet. PR #1 and PR #2 need changes before they can be merged. See the [team work guide](docs/coordination-plan.md) for the current status and the next steps.

## Start here

Immediate next steps (24 October 2026):

- [Sourasish: app foundation (PDF)](docs/next-steps/sourasish/sourasish-next-steps.pdf) · [LaTeX source](docs/next-steps/sourasish/main.tex)
- [Ritendu: CMS and permissions (PDF)](docs/next-steps/ritendu/ritendu-next-steps.pdf) · [LaTeX source](docs/next-steps/ritendu/main.tex)
- [Shreyam: old-site inventory (PDF)](docs/next-steps/shreyam/shreyam-next-steps.pdf) · [LaTeX source](docs/next-steps/shreyam/main.tex)
- [Pritish: frontend timing (PDF)](docs/next-steps/pritish/pritish-next-steps.pdf) · [LaTeX source](docs/next-steps/pritish/main.tex)

Read the team guide and your handbook before starting.

- [Team work guide](docs/coordination-plan.md): who can work now, what depends on what, copy-ready instructions for coding agents, and how to review PRs.
- [Orchestrator guide](main.tex): decisions, team roles and release steps.
- [Sourasish handbook](docs/assignments/sourasish.pdf) · [editable copy](docs/assignments/sourasish.tex)
- [Ritendu handbook](docs/assignments/ritendu.pdf) · [editable copy](docs/assignments/ritendu.tex)
- [Pritish handbook](docs/assignments/pritish.pdf) · [editable copy](docs/assignments/pritish.tex)
- [Shreyam handbook](docs/assignments/shreyam.pdf) · [editable copy](docs/assignments/shreyam.tex)

## Main project choices

- The new site will use Next.js and Payload CMS in one app. Payload is the admin tool for editing site content.
- PostgreSQL stores the content. Object storage and a CDN serve large files such as images and videos.
- Keep the old website available so the team can roll back if needed.
- Do not move workshop Q&A data or code into the new app. Do not delete the old Q&A service or data.
- Do not create paid hosting, database or storage accounts until the orchestrator approves the owner and budget.
- Do not move the public domain until the orchestrator approves the release.

## Start work

Sourasish can build the app foundation, Ritendu can fix the content and permission rules, and Shreyam can inventory the old website at the same time. Pritish can start page work after the app and the content fields are ready.

Read the team work guide before starting.