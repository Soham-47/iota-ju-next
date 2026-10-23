# IOTA JU website redesign

This is the separate GitHub repository for planning and implementing the redesigned IOTA JU website: [Soham-47/iota-ju-next](https://github.com/Soham-47/iota-ju-next). The redesign is planned as a Next.js App Router and Payload CMS application. The public site, CMS admin, authentication and content APIs will run in one Vercel project. PostgreSQL and object storage will be separate managed services.

## Current state

The shared `main` branch currently contains the team handbooks and architecture decisions; the application scaffold has **not** merged. PR #2 proposes P01/P02 but is not complete yet. Sourasish owns the platform foundation. The GitHub remote is established; paid providers, production resources and the public domain are still unconfigured and require approval.

## Read the right guide

- [Coordination plan](docs/coordination-plan.md): start-now work, true dependencies, PR order and team sync.

- [Orchestrator guide (PDF)](docs/assignments/orchestrator-guide.pdf) · [LaTeX source](main.tex): decisions, team coordination, phase gates, integration and release ownership.
- [Sourasish: platform and release integration (PDF)](docs/assignments/sourasish.pdf) · [LaTeX source](docs/assignments/sourasish.tex)
- [Ritendu: CMS, permissions and content data (PDF)](docs/assignments/ritendu.pdf) · [LaTeX source](docs/assignments/ritendu.tex)
- [Pritish: design and public website (PDF)](docs/assignments/pritish.pdf) · [LaTeX source](docs/assignments/pritish.tex)
- [Shreyam: source inventory, migration and media (PDF)](docs/assignments/shreyam.pdf) · [LaTeX source](docs/assignments/shreyam.tex)

The name-to-workstream mapping follows the member order in the request. Pritish's handbook uses shorter, sequential steps and defines technical terms as they appear.

## Shared project decisions

- Keep the existing website live and available for rollback.
- Preserve approved text, people, departments, roles, project ordering, reports, links, images and existing videos.
- Do not copy original media archives, production secrets, participant data or the legacy workshop Q&A backend into this repository.
- Keep Next.js and Payload in the same application. Do not add a second Express or FastAPI service.
- Use a managed PostgreSQL database and object storage/CDN. Provider choice and spend limit must be approved before provisioning.
- Use a supported Node.js LTS release (Payload currently requires at least 20.18.1) and pnpm. Sourasish records the exact compatible package versions in the lockfile when implementation starts.

## Reading and compiling the handbooks

PDF handbooks are ready to read above; each editable source is a standalone LaTeX file. The handbooks use a plain black-and-white article layout with no custom images or color theme. To rebuild them locally, use a LaTeX distribution with the standard packages listed in each file's preamble, then run pdflatex on the selected source.

## Start implementation

1. The orchestrator confirms each member's GitHub login, records the source commit being inventoried, and assigns the current task IDs.
2. Sourasish completes the reproducible app foundation; Shreyam starts the source inventory in parallel; Ritendu drafts the contract and fixes pure permission logic while marking source-dependent fields pending.
3. Members work from their handbooks and the coordination plan. Each PR states its task ID, owner, dependencies, checks, evidence and remaining blockers.
4. Approve Vercel/database/storage ownership and budget before provisioning. Do not switch the public domain until the orchestrator approves the release gate.
