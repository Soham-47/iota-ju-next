# Content contract (B01)

| | |
|---|---|
| Status | **DRAFT v0.1** — for review by Sourasish, Pritish and Shreyam. Not yet agreed. |
| Owner | Ritendu |
| Date | 22 October 2026 |
| Handbook IDs | B01 (this file), feeds B02–B07, P03, F03–F07, M02–M05 |

This file defines the shape of the content the public site reads. Field names are
**proposals** until the reviewers in section 9 sign off. Anything marked
`PENDING M01` depends on Shreyam's source inventory and must be checked against
it before collections are built. Do not build a reader, page or importer on a field
that is not listed here; ask for it to be added.

## 1. Rules that apply to every record

1. **Identity.** Names and slugs are never identity keys.
   - `stableKey` is generated on the server (UUID) when a record is created. It is never accepted from a client and never changes.
   - `legacyKey` is `<source-kind>:<source-id>` (for example `project:temperlink`). It is written only by the importer or an Admin, is read-only afterwards, and is how repeat imports find the same record.
   - Neither key is ever returned by a public reader.
2. **Publication state is separate from lifecycle.** Publication (`draft` / `published`) is editorial. Lifecycle (Ongoing, Completed, Cancelled …) is a fact about the project or event. A Completed event can be Published.
3. **Unknown stays unknown.** No guessed dates, departments, roles, awards, identities or "is this event open" values. A field the source does not state is empty, and where the gap matters it is listed in the owner-review list.
4. **Original copy is preserved.** Summary and body text are stored as approved in the source. Editors may revise later through the CMS; the importer must not overwrite those revisions (conflict report instead).
5. **Public vs private.** Every field below is tagged **Public** (may reach a page) or **Private** (CMS only). Public readers return an explicit allow-list of fields, never a whole document.
6. **Drafts and private media never reach the public.** A relationship may only point at a published record or approved public media. Readers bound relationship depth.
7. **Deletion.** A record referenced by another record cannot be hard-deleted until the references are resolved.
8. **No arbitrary HTML or CSS** is stored in content or globals.

## 2. Project

Source: ordered cards (11 known) plus the separate AGV feature and linked/unlisted historical detail pages. `PENDING M01` for exact counts.

| Field | Type | Req. to publish | Public | Notes |
|---|---|---|---|---|
| `stableKey` | text (server UUID) | auto | Private | See rule 1. |
| `legacyKey` | text, unique | importer-set | Private | Read-only after creation. |
| `title` | text | yes | Public | Original wording. |
| `slug` | text, unique | yes | Public | Lowercase letters, digits, hyphens. Reserved words blocked. Changing it emits a slug-change event. |
| `summary` | textarea | yes | Public | Card text, original wording. |
| `body` | rich text (Lexical) | no | Public | Detail page copy, original wording. |
| `sortOrder` | integer | yes | Public | Explicit order. Preserves the known 11-card order. Not derived from date or title. |
| `lifecycle` | select: `ongoing`, `completed` | yes | Public | Drone Automation stays `ongoing`. |
| `awardLabel` | text | no | Public | Separate from lifecycle, e.g. `IEEE SSCS 2026`. Preserve existing competition labels. |
| `awardYear` | integer (4 digits) | no | Public | Only if the source states it. |
| `featuredMedia` | relation → Media | no | Public | Must be approved public media. |
| `gallery` | array of relation → Media | no | Public | |
| `demoVideo` | relation → Media, or approved embed URL | no | Public | Full demo kept intact; not autoplayed on the catalogue. |
| `reports` | array `{label, file → Media}` | no | Public | PDFs; downloadable. |
| `people` | array `{person → Person, role?}` | no | Public | **Verified** links only. No invented contributors. |
| `externalLinks` | array `{label, url}` | no | Public | `https` only; validated. |
| `isAgvFeature` | checkbox | no | Public | PENDING M01: confirm whether AGV needs a flag or is just another record with a feature slot on Home. |
| `reviewNotes` | textarea | no | **Private** | Open source questions. |
| `_status` | `draft` / `published` | — | — | Payload versions/drafts. |

Rules: unique slug for every public detail route; incomplete drafts allowed for authorized users; required fields validated at publish; a hidden project (not a main card) is still a record.

## 3. Event

Source: current event page and historical event pages. `PENDING M01`.

| Field | Type | Req. to publish | Public | Notes |
|---|---|---|---|---|
| `stableKey`, `legacyKey` | as Project | | Private | |
| `title`, `slug` | text | yes | Public | Slug rules as Project. |
| `body` | rich text | no | Public | Original text. |
| `datePrecision` | select: `unknown`, `year`, `month`, `day`, `dateTime` | yes | Public | Defaults to `unknown`. |
| `dateValue` | date | if precision ≠ `unknown` | Public | Stored at the stated precision only (see section 7 for the timezone rule). A year-only event is never turned into a full date. |
| `endDateValue` | date | no | Public | Same precision rule. |
| `venue` | text | no | Public | |
| `lifecycle` | select: `scheduled`, `completed`, `postponed`, `cancelled`, `unknown` | yes | Public | Never derived from the date in the CMS. `unknown` is allowed and is the default for imports. "Upcoming" is computed by the reader (section 7) and never stored. |
| `poster` | relation → Media | no | Public | |
| `gallery` | array → Media | no | Public | |
| `reports` | array `{label, file → Media}` | no | Public | |
| `fullDemo` | Media or approved embed URL | no | Public | |
| `actionLink` | `{label, url}` | no | Public | **Only** with an owner-approved URL. Old Register Now / Live Portal actions are not restored. |
| `actionApprovedBy` | text | required if `actionLink` set | **Private** | Who approved the link. |
| `reviewNotes` | textarea | no | **Private** | Questionable dates / statuses. |
| `_status` | `draft` / `published` | — | — | |

## 4. Person and Membership

| Person field | Type | Public | Notes |
|---|---|---|---|
| `stableKey`, `legacyKeys[]` | | Private | A merged person can carry several source keys. |
| `name` | text | Public | Original spelling. |
| `department` | text | Public | Corrected values kept: Raunak Panja → Electrical Engineering; Ritendu's corrected department text. `PENDING M01` for the rest. |
| `portrait` | relation → Media | Public | Missing portrait is allowed; never substituted. |
| `links` | array `{type, url}` | Public | `type` in a fixed list (e.g. email, linkedin, github, website); only **approved** public links. |
| `identityReview` | select: `unreviewed`, `confirmed-distinct`, `merged` | **Private** | Similar names do not prove same person. Merge only after review. |
| `reviewNotes` | textarea | **Private** | |

| Membership field | Type | Public | Notes |
|---|---|---|---|
| `person` | relation → Person, required | Public | |
| `group` | select | Public | Options `PENDING M01` (faculty, current team, alumni and any sub-groups). A separate Groups collection is an alternative; decide with Pritish. |
| `academicYear` | text, pattern `YYYY-YY` | Public | |
| `role` | text | Public | Verified role for **this** membership; may be empty. |
| `displayOrder` | integer | Public | Order within group+year. |
| `legacyKey` | text, unique | Private | Source appearance key for reconciliation. |
| `_status` | `draft` / `published` | — | |

Rules: one person → many memberships; a person shown in two groups keeps both roles and orders; same-name different people stay separate records; deleting a person with memberships is blocked. Uniqueness proposal: one membership per (`person`, `group`, `academicYear`) — confirm there is no valid duplicate in the source.

## 5. Milestone and Redirect

| Milestone field | Type | Public | Notes |
|---|---|---|---|
| `stableKey`, `legacyKey` | | Private | |
| `title`, `copy` | text / rich text | Public | Original copy. |
| `datePrecision` | select: `year`, `month`, `day` | Public | Year-only stays year-only. |
| `dateValue` | date | Public | At stated precision. |
| `displayOrder` | integer | Public | |
| `relatedProjects`, `relatedEvents`, `relatedPeople` | relations | Public | Published records only; no draft leaks through links. |
| `_status` | | — | |

| Redirect field | Type | Public | Notes |
|---|---|---|---|
| `fromPath` | text, unique | Private (read by the resolver) | Exact old path, original casing and encoding. |
| `toPath` | text | Private (read by the resolver) | Canonical internal path starting with a single `/`. No scheme, no `//`, no backslash. |
| `statusCode` | select | Private | `301`, `302`, `307`, `308`. `410` for retired pages is an open question (section 8). |
| `reason` | text | Private | |
| Validation | | | Block self-loop and any chain that returns to a `fromPath` (two-record loop); block external destinations. |

## 6. Globals and users

**Home** — hero heading and text (original wording); `backgroundVideo` and `posterImage` (Media); `featuredProjects[]` and `featuredEvents[]` (published records only); optional section copy. Exact fields to be agreed with Pritish before B06a.

**About** — intro and body copy (approved source text); optional images (Media).

**SiteSettings** — `contactEmail` (default `iotajuofficial@gmail.com`); `navigation[]` `{label, path}`; `footerLinks[]`; `logo` and `favicon` (Media); public social links. One shared source for header, footer and contact email.

**CMS User (private)** — email, name, `role` (`admin` | `editor`), `active`. Invite-only; no public sign-up. This collection never feeds the team page.

## 7. Timezone and "upcoming" rule (proposal — needs orchestrator approval)

- Date-only values (`year`, `month`, `day`) are stored as calendar values with no timezone and displayed as written.
- `dateTime` values are stored in UTC together with an explicit IANA zone, defaulting to `Asia/Kolkata`.
- "Upcoming" is computed at read time by comparing in `Asia/Kolkata` and only for events whose precision is `day` or `dateTime` and whose lifecycle is `scheduled`. A viewer's timezone never changes the result.
- The CMS never stores "upcoming", "live" or a countdown.

## 8. Publication event (proposal for Sourasish, P05)

Sent only after the write has committed. Payload:

```json
{
  "collection": "projects",
  "id": "<record id>",
  "operation": "publish | unpublish | update | slugChange | delete | mediaRevoke",
  "oldSlug": "temperlink",
  "newSlug": "temperlink",
  "affected": [{ "collection": "memberships", "id": "…" }],
  "occurredAt": "2026-10-22T06:42:00Z"
}
```

`affected` lists the public relationships that must also refresh. Hook failures are logged visibly and retried by the receiver; they never silently succeed.

## 9. Open questions and sign-off

| # | Question | Who | Status |
|---|---|---|---|
| 1 | `payload.config.ts` location: root or `src/`? Handouts disagree. | Sourasish | open |
| 2 | Public fields each page needs (project, event, team, home). | Pritish | open |
| 3 | Media field set, and who registers it in the config. | Shreyam | open |
| 4 | Real group list, counts, duplicate-person candidates, AGV handling. | Shreyam (M01) | open |
| 5 | Timezone / "upcoming" rule (section 7). | Orchestrator | open |
| 6 | Allow `410` for retired Q&A URLs? Approved response. | Orchestrator | open |
| 7 | Redirects: Editor draft + Admin publish, or Admin-only? | Orchestrator | open |
| 8 | Who may publish; account-recovery email owner. | Orchestrator | open |
| 9 | Event publication-event timing relative to commit. | Sourasish | open |

| Reviewer | Section(s) | Signed off |
|---|---|---|
| Sourasish | 1, 6, 8 | |
| Pritish | 2–6 (public fields) | |
| Shreyam | 2–5 and Media | |
| Orchestrator | 7, 9 | |
