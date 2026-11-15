/**
 * B07 relationship-safety rules as pure functions (no Payload imports).
 * Field-independent on purpose: callers pass in plain "reference" objects, so these
 * can be tested now and wrapped by Payload hooks after P01 and B01 sign-off.
 */

export type RecordKind = 'project' | 'event' | 'person' | 'membership' | 'milestone' | 'media' | 'global'

/** What the guards need to know about a record that something links to. */
export type RefState = {
  kind: RecordKind
  id: string
  exists: boolean
  published: boolean // draft/published (publication state)
  approved?: boolean // media only: approved for public use
  visibility?: 'public' | 'private' // media only
}

export type Problem = { ref: string; reason: string }
export type Check = { ok: true } | { ok: false; problems: Problem[] }

const label = (r: { kind: string; id: string }) => `${r.kind}:${r.id}`

/**
 * Before publishing record X: every linked record must exist and be published, and every
 * linked media item must also be approved and public. Returns ALL problems, not just the first.
 */
export function checkPublishReferences(refs: RefState[]): Check {
  const problems: Problem[] = []
  for (const r of refs) {
    if (!r.exists) {
      problems.push({ ref: label(r), reason: 'linked record does not exist' })
      continue
    }
    if (!r.published) problems.push({ ref: label(r), reason: 'linked record is not published' })
    if (r.kind === 'media') {
      if (r.approved !== true) problems.push({ ref: label(r), reason: 'media is not approved for public use' })
      if (r.visibility !== 'public') problems.push({ ref: label(r), reason: 'media is not public' })
    }
  }
  return problems.length ? { ok: false, problems } : { ok: true }
}

/** Shape a media relation for an ANONYMOUS reader: only a public, approved, published item; only safe fields. */
export type MediaInput = {
  id: string
  published: boolean
  approved?: boolean
  visibility?: 'public' | 'private'
  publicUrl?: string
  alt?: string
  [privateField: string]: unknown // master URL, storage key, etc. are never copied
}
export type PublicMedia = { id: string; url: string; alt: string }

export function toPublicMedia(m: MediaInput | null | undefined): PublicMedia | null {
  if (!m || !m.published || m.approved !== true || m.visibility !== 'public') return null
  if (typeof m.publicUrl !== 'string' || m.publicUrl === '') return null
  return { id: m.id, url: m.publicUrl, alt: typeof m.alt === 'string' ? m.alt : '' }
}

/** A record that links to the target (for deletion and refresh decisions). */
export type Referrer = { kind: RecordKind; id: string; field: string; publicPaths: string[] }

/** Hard delete is blocked while anything still references the target. */
export function checkDeletion(target: { kind: RecordKind; id: string }, referrers: Referrer[]): Check {
  const own = referrers.filter((r) => !(r.kind === target.kind && r.id === target.id))
  if (own.length === 0) return { ok: true }
  return {
    ok: false,
    problems: own.map((r) => ({
      ref: label(r),
      reason: `still references ${label(target)} via "${r.field}"; remove or replace the reference first (or unpublish instead of deleting)`,
    })),
  }
}

export type Change = {
  kind: RecordKind
  id: string
  /** public detail path of the changed record itself, if it has one, before and after */
  oldPath?: string
  newPath?: string
  /** public list pages where this kind of record appears */
  listPaths?: string[]
  /** true for unpublish, delete, or media revocation */
  removedFromPublic?: boolean
}
export type RefreshPlan = { refresh: string[]; redirectNeeded: { from: string; to: string } | null; removed: string[] }

/** Which public pages must refresh after a change, and whether a slug change needs a redirect. */
export function planRefresh(change: Change, referrers: Referrer[]): RefreshPlan {
  const set = new Set<string>()
  for (const p of change.listPaths ?? []) set.add(p)
  for (const r of referrers) for (const p of r.publicPaths) set.add(p)
  if (change.oldPath) set.add(change.oldPath)
  if (change.newPath) set.add(change.newPath)

  const slugChanged = !!change.oldPath && !!change.newPath && change.oldPath !== change.newPath
  const removed: string[] = []
  if (change.removedFromPublic) {
    if (change.oldPath) removed.push(change.oldPath)
    else if (change.newPath) removed.push(change.newPath)
  }
  return {
    refresh: [...set].sort(),
    redirectNeeded: slugChanged && !change.removedFromPublic ? { from: change.oldPath!, to: change.newPath! } : null,
    removed,
  }
}

export type HookFailure = { hook: string; record: string; message: string; at: string }

/**
 * Run a hook body so a failure is never silent: it is reported with context,
 * then re-thrown so the write does not look successful.
 */
export async function runGuarded<T>(
  hook: string,
  record: string,
  fn: () => Promise<T> | T,
  report: (f: HookFailure) => void,
  now: () => Date = () => new Date(),
): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    try {
      report({ hook, record, message, at: now().toISOString() })
    } catch {
      /* reporting must never mask the original error */
    }
    throw e
  }
}
