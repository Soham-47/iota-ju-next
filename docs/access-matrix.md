# Access matrix and permission test plan (B02)

| | |
|---|---|
| Status | **DRAFT v0.1** — decisions marked *proposed* need orchestrator approval |
| Owner | Ritendu |
| Date | 22 October 2026 |
| Implements | `src/access/policy.ts` (pure logic) and, after P01, thin Payload wrappers |
| Tested by | `tests/access-policy.test.ts` now; `tests/permissions.test.ts` (direct API against staging) after P01 |

## 1. Roles

- **Anonymous** — no account. Reads published public fields only, through Sourasish's readers.
- **Editor** — invited, active account. Creates and revises **drafts**. Cannot publish, unpublish, delete, manage accounts or grant roles.
- **Admin** — invited, active account. Publishes and unpublishes, deletes (subject to reference guards), manages accounts and roles.
- An **inactive** account is treated as Anonymous for every operation.
- There is no public registration and no other role.

## 2. Matrix: content collections

Applies to Projects, Events, People, Memberships, Milestones.

| Operation | Anonymous | Editor | Admin |
|---|---|---|---|
| Read published, public fields | yes (via readers) | yes | yes |
| Read drafts / unpublished / private fields | **no** | yes | yes |
| Create | no | yes, **only as a draft** | yes |
| Save a draft revision (also over a published record; the live version is unchanged) | no | yes | yes |
| Publish | no | **no** | yes |
| Unpublish | no | **no** | yes |
| Restore a revision as a draft | no | yes | yes |
| Delete | no | **no** | yes, unless referenced |

Decisive rule: for Editors the **incoming** request must be an explicit draft save. The record's previously saved status is never used to authorize a write.

## 3. Matrix: other collections

| Collection / global | Anonymous | Editor | Admin |
|---|---|---|---|
| Users | no access | read **own** record; may change own name and password; **cannot** change `role` or `active` | full management |
| Redirects | no | *proposed:* no write (live routing) | create / update / delete |
| Globals (Home, About, SiteSettings) | published values via readers | save drafts | publish |
| Media | public delivery files only | upload as private; cannot approve for public | approve for public, revoke |

Media approval detail belongs to Shreyam's M02; this table records only what the role matrix needs.

## 4. Account rules

1. Only an Admin can create accounts or change `role` / `active`.
2. An Editor can never change any `role` or `active` value, including their own.
3. The last active Admin can never be demoted, deactivated or deleted, by anyone including themselves.
4. First-admin bootstrap is private and limited to the chosen owner. It is a one-time procedure documented in `docs/operations.md`, not an open endpoint.
5. Recovery (password reset) is configured only after the orchestrator assigns a club-owned email account.
6. Legacy Q&A credentials are never imported.

## 5. Attack cases and expected results

Each case must be covered by a unit test on the policy now, and again as a **direct API request** (not only through the Admin UI) after P01.

| ID | Case | Expected |
|---|---|---|
| PERM-01 | Anonymous creates, updates, deletes any content | denied |
| PERM-02 | Anonymous reads a draft, by any query or draft flag | denied |
| PERM-03 | Anonymous reads any user record | denied |
| PERM-04 | Editor creates with status `published` | denied |
| PERM-05 | Editor creates a draft | allowed |
| PERM-06 | Editor updates an **already-published** record with status `published` | denied (previous status must not authorize) |
| PERM-07 | Editor saves a draft over a published record | allowed; live unchanged |
| PERM-08 | Editor update with no explicit status | denied |
| PERM-09 | Editor unpublishes | denied |
| PERM-10 | Editor deletes | denied |
| PERM-11 | Editor sets own `role` to `admin` | denied (field-level) |
| PERM-12 | Editor changes another user's role / active | denied |
| PERM-13 | Editor creates a user | denied |
| PERM-14 | Editor reads another user's record | denied |
| PERM-15 | Admin publishes, unpublishes, deletes | allowed |
| PERM-16 | Admin demotes or deactivates the last active Admin | denied |
| PERM-17 | Inactive Editor / Admin attempts any write | denied |
| PERM-18 | Unknown role string on a user | treated as no access |
| PERM-19 | Editor edits a Redirect | denied (proposed) |
| PERM-20 | Hiding a button is not a control | covered by the direct-API versions of all of the above |

## 6. Staging checks (after P01, B02 acceptance)

- Login, logout, and recovery in a browser.
- Attempt to self-promote an Editor with a direct request: must fail.
- Attempt to publish as Editor with a direct request: must fail.
- Check drafts and user records from a signed-out client using direct API calls.
- Confirm Payload Local API calls in public readers set `overrideAccess: false` (reviewed with Sourasish).

## 7. Open points

- Whether Redirects stay Admin-only (proposed) or follow draft/publish (orchestrator).
- Whether an Editor may upload Media directly or only attach pre-approved files (Shreyam / orchestrator).
- Who is the first Admin and who receives recovery email (orchestrator).
