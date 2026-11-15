import { describe, expect, it } from 'vitest'
import {
  checkDeletion,
  checkPublishReferences,
  planRefresh,
  runGuarded,
  toPublicMedia,
  type HookFailure,
  type RefState,
  type Referrer,
} from '../src/hooks/relationshipRules'

const media = (o: Partial<RefState> = {}): RefState => ({
  kind: 'media', id: 'm1', exists: true, published: true, approved: true, visibility: 'public', ...o,
})
const person = (o: Partial<RefState> = {}): RefState => ({ kind: 'person', id: 'p1', exists: true, published: true, ...o })

describe('checkPublishReferences', () => {
  it('passes when every link is published and media is approved and public', () => {
    expect(checkPublishReferences([person(), media()]).ok).toBe(true)
  })
  it('reports a missing record', () => {
    const r = checkPublishReferences([person({ exists: false })])
    expect(r.ok).toBe(false)
  })
  it('reports an unpublished linked record', () => {
    expect(checkPublishReferences([person({ published: false })]).ok).toBe(false)
  })
  it('blocks private, unapproved or draft media, and lists every problem', () => {
    const r = checkPublishReferences([media({ visibility: 'private', approved: false, published: false })])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.problems.length).toBe(3)
  })
})

describe('toPublicMedia (nested relations never leak private/draft URLs)', () => {
  const full = { id: 'm1', published: true, approved: true, visibility: 'public' as const, publicUrl: 'https://cdn.x/a.jpg', alt: 'a', masterUrl: 'https://private/master.tif', storageKey: 'k' }
  it('returns only safe fields for a public approved item', () => {
    expect(toPublicMedia(full)).toEqual({ id: 'm1', url: 'https://cdn.x/a.jpg', alt: 'a' })
  })
  it('returns null for draft, unapproved, private, urlless or missing media', () => {
    expect(toPublicMedia({ ...full, published: false })).toBeNull()
    expect(toPublicMedia({ ...full, approved: false })).toBeNull()
    expect(toPublicMedia({ ...full, visibility: 'private' })).toBeNull()
    expect(toPublicMedia({ ...full, publicUrl: '' })).toBeNull()
    expect(toPublicMedia(null)).toBeNull()
  })
  it('never copies private fields', () => {
    expect(JSON.stringify(toPublicMedia(full))).not.toMatch(/private|storageKey|masterUrl/)
  })
})

describe('checkDeletion', () => {
  const refs: Referrer[] = [
    { kind: 'membership', id: 'ms1', field: 'person', publicPaths: ['/team'] },
    { kind: 'membership', id: 'ms2', field: 'person', publicPaths: ['/alumni'] },
  ]
  it('blocks deleting a person that memberships still reference, naming each referrer', () => {
    const r = checkDeletion({ kind: 'person', id: 'p1' }, refs)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.problems.map((p) => p.ref)).toEqual(['membership:ms1', 'membership:ms2'])
  })
  it('allows deletion once references are resolved', () => {
    expect(checkDeletion({ kind: 'person', id: 'p1' }, []).ok).toBe(true)
  })
  it('ignores a self reference', () => {
    expect(checkDeletion({ kind: 'person', id: 'p1' }, [{ kind: 'person', id: 'p1', field: 'x', publicPaths: [] }]).ok).toBe(true)
  })
  it('blocks revoking/deleting media that a project still shows', () => {
    const r = checkDeletion({ kind: 'media', id: 'm1' }, [{ kind: 'project', id: 'drone', field: 'cover', publicPaths: ['/project/drone'] }])
    expect(r.ok).toBe(false)
  })
})

describe('planRefresh', () => {
  it('a person shown in several groups refreshes every group page', () => {
    const referrers: Referrer[] = [
      { kind: 'membership', id: 'a', field: 'person', publicPaths: ['/team'] },
      { kind: 'membership', id: 'b', field: 'person', publicPaths: ['/alumni'] },
      { kind: 'membership', id: 'c', field: 'person', publicPaths: ['/team'] },
    ]
    expect(planRefresh({ kind: 'person', id: 'p1' }, referrers).refresh).toEqual(['/alumni', '/team'])
  })
  it('a slug change refreshes old and new paths and asks for a redirect', () => {
    const p = planRefresh(
      { kind: 'project', id: 'x', oldPath: '/project/old', newPath: '/project/new', listPaths: ['/projects'] },
      [],
    )
    expect(p.refresh).toEqual(['/project/new', '/project/old', '/projects'])
    expect(p.redirectNeeded).toEqual({ from: '/project/old', to: '/project/new' })
  })
  it('unpublishing marks the page removed and needs no redirect', () => {
    const p = planRefresh({ kind: 'event', id: 'e', oldPath: '/events/x', newPath: '/events/x', listPaths: ['/events'], removedFromPublic: true }, [])
    expect(p.removed).toEqual(['/events/x'])
    expect(p.redirectNeeded).toBeNull()
  })
  it('revoking media refreshes every page that showed it', () => {
    const p = planRefresh({ kind: 'media', id: 'm1', removedFromPublic: true }, [
      { kind: 'project', id: 'drone', field: 'cover', publicPaths: ['/project/drone', '/projects'] },
    ])
    expect(p.refresh).toEqual(['/project/drone', '/projects'])
  })
})

describe('runGuarded (hook failures are visible)', () => {
  const fixed = () => new Date('2026-11-15T00:00:00Z')
  it('reports then re-throws, so the write does not look successful', async () => {
    const seen: HookFailure[] = []
    await expect(
      runGuarded('afterPublish', 'project:drone', () => { throw new Error('boom') }, (f) => seen.push(f), fixed),
    ).rejects.toThrow('boom')
    expect(seen).toEqual([{ hook: 'afterPublish', record: 'project:drone', message: 'boom', at: '2026-11-15T00:00:00.000Z' }])
  })
  it('does not let a failing reporter hide the original error', async () => {
    await expect(
      runGuarded('h', 'r', async () => { throw new Error('orig') }, () => { throw new Error('reporter down') }),
    ).rejects.toThrow('orig')
  })
  it('returns the value on success without reporting', async () => {
    const seen: HookFailure[] = []
    expect(await runGuarded('h', 'r', () => 42, (f) => seen.push(f))).toBe(42)
    expect(seen).toHaveLength(0)
  })
})
