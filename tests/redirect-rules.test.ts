import { describe, expect, it } from 'vitest'
import {
  checkInternalPath,
  checkOldPath,
  checkStatus,
  validateRedirect,
  type ExistingRedirect,
} from '../src/hooks/redirectRules'

const ok = (r: { ok: boolean }) => r.ok
const input = (oldPath: unknown, destination: unknown, status: unknown = 301) => ({ oldPath, destination, status })

describe('internal path checks', () => {
  it('accepts normal internal paths', () => {
    for (const p of ['/', '/events', '/project/drone', '/events/lord-of-the-ring?ref=a']) {
      expect(ok(checkInternalPath(p))).toBe(true)
    }
  })
  it('rejects external URLs and open-redirect tricks', () => {
    for (const p of [
      'https://evil.com', 'http://evil.com/x', '//evil.com', '/\\evil.com', '\\\\evil.com',
      'javascript:alert(1)', '/%2Fevil.com', '%2F%2Fevil.com',
      'events', '', ' /events', '/a b', '/a\nb', '/../etc', '/a/./b', '/x#frag',
    ]) {
      expect(ok(checkInternalPath(p)), p).toBe(false)
    }
    expect(ok(checkInternalPath(undefined))).toBe(false)
    expect(ok(checkInternalPath(42))).toBe(false)
  })
  it('rejects encoded protocol-relative and backslash forms', () => {
    expect(ok(checkInternalPath('/%5Cevil.com'))).toBe(false)
    expect(ok(checkInternalPath('/%'))).toBe(false)
  })
  it('old path may not carry a query string', () => {
    expect(ok(checkOldPath('/events?x=1'))).toBe(false)
    expect(ok(checkOldPath('/events'))).toBe(true)
  })
})

describe('status', () => {
  it('allows only approved statuses; 410 is not approved yet', () => {
    for (const s of [301, 302, 307, 308]) expect(ok(checkStatus(s))).toBe(true)
    for (const s of [200, 404, 410, '301', undefined]) expect(ok(checkStatus(s))).toBe(false)
  })
})

describe('validateRedirect', () => {
  const existing: ExistingRedirect[] = [
    { id: '1', oldPath: '/old-a', destination: '/old-b' },
    { id: '2', oldPath: '/old-b', destination: '/events' },
  ]
  it('accepts a valid redirect', () => {
    expect(ok(validateRedirect(input('/old-c', '/projects'), existing))).toBe(true)
  })
  it('rejects an invalid destination', () => {
    expect(ok(validateRedirect(input('/old-c', 'https://evil.com'), existing))).toBe(false)
    expect(ok(validateRedirect(input('/old-c', '//evil.com'), existing))).toBe(false)
  })
  it('rejects a self-loop', () => {
    expect(ok(validateRedirect(input('/same', '/same'), existing))).toBe(false)
    expect(ok(validateRedirect(input('/same', '/same?x=1'), existing))).toBe(false)
  })
  it('rejects a two-record loop', () => {
    const two: ExistingRedirect[] = [{ id: '1', oldPath: '/b', destination: '/a' }]
    expect(ok(validateRedirect(input('/a', '/b'), two))).toBe(false)
  })
  it('rejects a longer loop (a -> b -> c -> a)', () => {
    const chain: ExistingRedirect[] = [
      { id: '1', oldPath: '/b', destination: '/c' },
      { id: '2', oldPath: '/c', destination: '/a' },
    ]
    expect(ok(validateRedirect(input('/a', '/b'), chain))).toBe(false)
  })
  it('rejects a duplicate old path but allows editing the same record', () => {
    expect(ok(validateRedirect(input('/old-a', '/projects'), existing))).toBe(false)
    expect(ok(validateRedirect(input('/old-a', '/projects'), existing, '1'))).toBe(true)
  })
  it('rejects an over-long chain', () => {
    const long: ExistingRedirect[] = Array.from({ length: 30 }, (_, i) => ({
      id: String(i), oldPath: `/p${i}`, destination: `/p${i + 1}`,
    }))
    expect(ok(validateRedirect(input('/start', '/p0'), long))).toBe(false)
  })
  it('rejects a bad status', () => {
    expect(ok(validateRedirect(input('/old-c', '/projects', 410), existing))).toBe(false)
  })
})
