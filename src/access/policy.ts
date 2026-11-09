/**
 * Pure access policy for the IOTA JU CMS (B02).
 *
 * This module has no Payload or Next imports on purpose. It decides who may do
 * what from plain data, so it can be unit-tested now and wrapped by thin
 * Payload access functions after P01 (see docs/access-matrix.md).
 *
 * Rules that matter most:
 * - Editors may only save drafts, decided from the INCOMING request. The
 *   previously saved status never authorizes a write.
 * - Inactive accounts and unknown roles have no access.
 * - Role / active changes are Admin-only, and the last active Admin is protected.
 */

export type Role = 'admin' | 'editor'

export type Actor = {
  id: string
  role: Role | string
  active: boolean
} | null | undefined

export type PublicationStatus = 'draft' | 'published'

/** What the incoming create/update request is asking for. */
export type WriteIntent = {
  /** Status the request will leave the record in. Undefined if the request omits it. */
  incomingStatus?: PublicationStatus
  /** True only for an explicit draft save (Payload `draft: true`). */
  savingAsDraft?: boolean
  /** Status of the stored record before this request. Informational only. */
  existingStatus?: PublicationStatus
}

export type AccessDecision = { allowed: boolean; reason: string }

const allow = (reason: string): AccessDecision => ({ allowed: true, reason })
const deny = (reason: string): AccessDecision => ({ allowed: false, reason })

/** Returns the actor's role only for an active account with a known role. */
export function effectiveRole(actor: Actor): Role | null {
  if (!actor || actor.active !== true) return null
  return actor.role === 'admin' || actor.role === 'editor' ? actor.role : null
}

export const isAdmin = (actor: Actor): boolean => effectiveRole(actor) === 'admin'
export const isEditorOrAdmin = (actor: Actor): boolean => effectiveRole(actor) !== null

/** Drafts, unpublished records and private fields are visible to staff only. */
export function canReadDrafts(actor: Actor): AccessDecision {
  return isEditorOrAdmin(actor)
    ? allow('staff may read drafts')
    : deny('drafts are visible to active Editors and Admins only')
}

/** Create a content record. Editors may only create an explicit draft. */
export function canCreateContent(actor: Actor, intent: WriteIntent): AccessDecision {
  const role = effectiveRole(actor)
  if (!role) return deny('no active account')
  if (role === 'admin') return allow('admin')
  return isExplicitDraftSave(intent)
    ? allow('editor may create a draft')
    : deny('editors may only create drafts')
}

/**
 * Update a content record (save draft, publish, or unpublish).
 * The decision uses the incoming request, never existingStatus.
 */
export function canUpdateContent(actor: Actor, intent: WriteIntent): AccessDecision {
  const role = effectiveRole(actor)
  if (!role) return deny('no active account')
  if (role === 'admin') return allow('admin')
  return isExplicitDraftSave(intent)
    ? allow('editor may save a draft revision')
    : deny('editors may only save explicit drafts; publish and unpublish are Admin-only')
}

/** Unpublish = a published record being set back to draft without a draft save. */
export function isUnpublish(intent: WriteIntent): boolean {
  return (
    intent.existingStatus === 'published' &&
    intent.incomingStatus === 'draft' &&
    intent.savingAsDraft !== true
  )
}

export function canPublish(actor: Actor): AccessDecision {
  return isAdmin(actor) ? allow('admin') : deny('publishing is Admin-only')
}

export function canDeleteContent(actor: Actor): AccessDecision {
  return isAdmin(actor) ? allow('admin') : deny('deleting is Admin-only')
}

/** Redirects change live routing: Admin-only (proposed, see access-matrix.md). */
export function canWriteRedirect(actor: Actor): AccessDecision {
  return isAdmin(actor) ? allow('admin') : deny('redirects are Admin-only')
}

// ---------------------------------------------------------------- users

export function canCreateUser(actor: Actor): AccessDecision {
  return isAdmin(actor) ? allow('admin') : deny('only Admins create accounts')
}

/** Admin reads any user; an Editor reads only their own record; nobody else reads any. */
export function canReadUser(actor: Actor, targetUserId: string): AccessDecision {
  const role = effectiveRole(actor)
  if (!role) return deny('no active account')
  if (role === 'admin') return allow('admin')
  return actor!.id === targetUserId
    ? allow('user reads own record')
    : deny('editors cannot read other users')
}

export const PRIVILEGED_USER_FIELDS = ['role', 'active'] as const
export type PrivilegedUserField = (typeof PRIVILEGED_USER_FIELDS)[number]

export type UserUpdate = {
  targetUserId: string
  /** Names of fields present in the incoming data. */
  changedFields: string[]
  /** Incoming values, only for privileged fields. */
  newRole?: string
  newActive?: boolean
  /** Target user's stored state before the change. */
  targetCurrentRole: string
  targetCurrentActive: boolean
  /** Active Admin accounts that exist right now, including the target if applicable. */
  activeAdminCount: number
}

/**
 * Decide an update to a user record, field-aware.
 * - Admin: may change anything, but not in a way that leaves zero active Admins.
 * - Editor: may update only their own non-privileged fields (e.g. name, password).
 */
export function canUpdateUser(actor: Actor, update: UserUpdate): AccessDecision {
  const role = effectiveRole(actor)
  if (!role) return deny('no active account')

  const touchesPrivileged = update.changedFields.some((f) =>
    (PRIVILEGED_USER_FIELDS as readonly string[]).includes(f),
  )

  if (role === 'editor') {
    if (update.targetUserId !== actor!.id) return deny('editors cannot edit other users')
    if (touchesPrivileged) return deny('only Admins may change role or active status')
    return allow('editor updates own profile')
  }

  // Admin: protect the last active Admin.
  const targetIsActiveAdmin =
    update.targetCurrentRole === 'admin' && update.targetCurrentActive === true
  if (targetIsActiveAdmin) {
    const staysAdmin = (update.newRole ?? update.targetCurrentRole) === 'admin'
    const staysActive = (update.newActive ?? update.targetCurrentActive) === true
    if ((!staysAdmin || !staysActive) && update.activeAdminCount <= 1) {
      return deny('the last active Admin cannot be demoted or deactivated')
    }
  }
  return allow('admin')
}

export function canDeleteUser(
  actor: Actor,
  target: { id: string; role: string; active: boolean },
  activeAdminCount: number,
): AccessDecision {
  if (!isAdmin(actor)) return deny('only Admins delete accounts')
  if (target.role === 'admin' && target.active && activeAdminCount <= 1) {
    return deny('the last active Admin cannot be deleted')
  }
  return allow('admin')
}

// -------------------------------------------------------------- helpers

function isExplicitDraftSave(intent: WriteIntent): boolean {
  return intent.incomingStatus === 'draft' && intent.savingAsDraft === true
}
