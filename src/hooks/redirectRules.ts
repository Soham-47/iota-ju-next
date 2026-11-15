/**
 * Pure validation for Redirect records (B06b). No Payload imports on purpose:
 * unit-testable now, wrapped by a Payload beforeValidate hook after P01.
 *
 * Rules: old path and destination are canonical INTERNAL paths only; no external
 * URLs or open redirects; no self-loop; no loop through existing redirects.
 * 410 (Gone) is NOT allowed until the orchestrator approves it (contract question 6).
 */

export const ALLOWED_REDIRECT_STATUSES = [301, 302, 307, 308] as const
export type RedirectStatus = (typeof ALLOWED_REDIRECT_STATUSES)[number]

export type RuleResult = { ok: true } | { ok: false; reason: string }
const ok: RuleResult = { ok: true }
const bad = (reason: string): RuleResult => ({ ok: false, reason })

const MAX_CHAIN = 20

/** A single canonical internal path: starts with one "/", no scheme/host/backslash/control chars. */
export function checkInternalPath(raw: unknown): RuleResult {
  if (typeof raw !== 'string' || raw.length === 0) return bad('path is required')
  if (raw.length > 2048) return bad('path is too long')
  if (!raw.startsWith('/')) return bad('path must start with "/" (internal paths only)')
  if (raw.startsWith('//')) return bad('protocol-relative URLs are not allowed')
  if (/[\\\u0000-\u001f\u007f\s]/.test(raw)) return bad('path contains backslash, whitespace or control characters')
  if (/^\/+[a-z][a-z0-9+.-]*:/i.test(raw)) return bad('path looks like it contains a scheme')
  // Check again after one round of percent-decoding (e.g. "/%2F/evil.com", "/%5Cevil.com").
  let decoded: string
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    return bad('path has invalid percent-encoding')
  }
  if (decoded !== raw) {
    if (decoded.startsWith('//')) return bad('encoded protocol-relative URL is not allowed')
    if (/[\\\u0000-\u001f\u007f]/.test(decoded)) return bad('encoded path contains backslash or control characters')
  }
  if (raw.split('/').some((seg) => seg === '..' || seg === '.')) return bad('dot segments are not allowed')
  if (raw.includes('#')) return bad('fragments are not allowed')
  return ok
}

/** Old path = exact path only (no query string). Destination may carry a query string. */
export function checkOldPath(raw: unknown): RuleResult {
  const base = checkInternalPath(raw)
  if (!base.ok) return base
  if ((raw as string).includes('?')) return bad('old path must not include a query string')
  return ok
}

export function checkStatus(status: unknown): RuleResult {
  return (ALLOWED_REDIRECT_STATUSES as readonly unknown[]).includes(status)
    ? ok
    : bad(`status must be one of ${ALLOWED_REDIRECT_STATUSES.join(', ')} (410 awaits orchestrator approval)`)
}

const pathOnly = (p: string) => p.split('?')[0]

export type ExistingRedirect = { id: string; oldPath: string; destination: string }

/**
 * Validate a redirect about to be saved against the existing ones.
 * `selfId` is the id of the record being edited (excluded from the lookup) or undefined for create.
 */
export function validateRedirect(
  input: { oldPath: unknown; destination: unknown; status: unknown },
  existing: ExistingRedirect[],
  selfId?: string,
): RuleResult {
  const a = checkOldPath(input.oldPath)
  if (!a.ok) return bad(`oldPath: ${a.reason}`)
  const b = checkInternalPath(input.destination)
  if (!b.ok) return bad(`destination: ${b.reason}`)
  const s = checkStatus(input.status)
  if (!s.ok) return s

  const from = input.oldPath as string
  const to = pathOnly(input.destination as string)

  if (to === from) return bad('self-loop: destination equals the old path')

  const others = existing.filter((r) => r.id !== selfId)
  if (others.some((r) => r.oldPath === from)) return bad('a redirect for this old path already exists')

  // Follow the chain from the destination; reaching `from` means a loop.
  const byOld = new Map(others.map((r) => [r.oldPath, pathOnly(r.destination)]))
  let cur = to
  for (let i = 0; i < MAX_CHAIN; i++) {
    const next = byOld.get(cur)
    if (next === undefined) return ok
    if (next === from || cur === from) return bad(`redirect loop through ${cur}`)
    cur = next
  }
  return bad(`redirect chain longer than ${MAX_CHAIN} hops (possible loop)`)
}
