/**
 * B02 direct-API permission tests (PERM-01..PERM-23 against a real Payload instance).
 *
 * STATUS: NOT RUN. Needs P01 (Payload + Postgres + test script) which is not merged.
 * Skipped automatically unless PERMISSIONS_TEST=1 and an ISOLATED test database
 * URL is configured. Never point this at production. The pure policy logic is
 * covered and passing in tests/access-policy.test.ts.
 *
 * Every call sets overrideAccess: false so Payload actually enforces access
 * (Local API defaults would bypass it).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const enabled = process.env.PERMISSIONS_TEST === '1'

describe.skipIf(!enabled)('B02 permissions via the Payload Local API', () => {
  let payload: any
  let admin: any
  let editor: any
  let inactiveEditor: any

  beforeAll(async () => {
    const { getPayload } = await import('payload')
    const config = (await import('../src/payload.config')).default
    payload = await getPayload({ config })
    // Seed three accounts with overrideAccess: true (test setup only).
    const mk = (email: string, role: string, active: boolean) =>
      payload.create({
        collection: 'users',
        overrideAccess: true,
        data: { email, password: 'Test-only-1!', displayName: email, role, active },
      })
    admin = await mk('admin@test.local', 'admin', true)
    editor = await mk('editor@test.local', 'editor', true)
    inactiveEditor = await mk('inactive@test.local', 'editor', false)
  })

  afterAll(async () => {
    for (const u of [admin, editor, inactiveEditor]) {
      if (u?.id) await payload.delete({ collection: 'users', id: u.id, overrideAccess: true })
    }
  })

  const as = (user: unknown) => ({ user, overrideAccess: false as const })

  it('Editor can change their own displayName', async () => {
    const r = await payload.update({
      collection: 'users', id: editor.id, data: { displayName: 'New Name' }, ...as({ ...editor, collection: 'users' }),
    })
    expect(r.displayName).toBe('New Name')
  })

  it('Editor cannot change own email, role or active (PERM-11, PERM-21)', async () => {
    for (const data of [{ email: 'x@test.local' }, { role: 'admin' }, { active: false }]) {
      await expect(
        payload.update({ collection: 'users', id: editor.id, data, ...as({ ...editor, collection: 'users' }) }),
      ).rejects.toThrow()
    }
  })

  it('Editor cannot change another account (PERM-12)', async () => {
    await expect(
      payload.update({ collection: 'users', id: admin.id, data: { displayName: 'Hacked' }, ...as({ ...editor, collection: 'users' }) }),
    ).rejects.toThrow()
  })

  it('inactive account cannot write (PERM-17)', async () => {
    await expect(
      payload.update({ collection: 'users', id: inactiveEditor.id, data: { displayName: 'Z' }, ...as({ ...inactiveEditor, collection: 'users' }) }),
    ).rejects.toThrow()
  })

  it('anonymous cannot read or create users (PERM-03)', async () => {
    const found = await payload.find({ collection: 'users', ...as(undefined) }).catch(() => ({ docs: [] }))
    expect(found.docs).toHaveLength(0)
    await expect(
      payload.create({ collection: 'users', data: { email: 'a@test.local', password: 'x', displayName: 'a', role: 'admin' }, ...as(undefined) }),
    ).rejects.toThrow()
  })

  it('Editor cannot create users (PERM-13) or read another user (PERM-14)', async () => {
    await expect(
      payload.create({ collection: 'users', data: { email: 'n@test.local', password: 'x', displayName: 'n', role: 'editor' }, ...as({ ...editor, collection: 'users' }) }),
    ).rejects.toThrow()
    const found = await payload.find({ collection: 'users', ...as({ ...editor, collection: 'users' }) })
    expect(found.docs.every((d: any) => d.id === editor.id)).toBe(true)
  })

  // Content-collection cases (publish/unpublish/delete, PERM-04..10, PERM-15) are added
  // with the collections in B03..B05, reusing these helpers.
  it.todo('last active Admin cannot be demoted/deactivated/deleted under concurrent requests (PERM-16, N1-U4)')
})
