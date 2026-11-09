import { describe, expect, it } from 'vitest'
import {
  canCreateContent,
  canCreateUser,
  canDeleteContent,
  canDeleteUser,
  canPublish,
  canReadDrafts,
  canReadUser,
  canUpdateContent,
  canUpdateUser,
  canWriteRedirect,
  effectiveRole,
  isUnpublish,
  type Actor,
  type UserUpdate,
} from '../src/access/policy'

const admin: Actor = { id: 'a1', role: 'admin', active: true }
const admin2: Actor = { id: 'a2', role: 'admin', active: true }
const editor: Actor = { id: 'e1', role: 'editor', active: true }
const inactiveEditor: Actor = { id: 'e2', role: 'editor', active: false }
const inactiveAdmin: Actor = { id: 'a3', role: 'admin', active: false }
const weird: Actor = { id: 'x1', role: 'superuser', active: true }

const draftSave = { incomingStatus: 'draft', savingAsDraft: true } as const
const publishReq = { incomingStatus: 'published', savingAsDraft: false } as const

describe('effectiveRole', () => {
  it('returns null for anonymous, inactive and unknown roles (PERM-17, PERM-18)', () => {
    expect(effectiveRole(null)).toBeNull()
    expect(effectiveRole(undefined)).toBeNull()
    expect(effectiveRole(inactiveEditor)).toBeNull()
    expect(effectiveRole(inactiveAdmin)).toBeNull()
    expect(effectiveRole(weird)).toBeNull()
  })
  it('returns the role for active known accounts', () => {
    expect(effectiveRole(admin)).toBe('admin')
    expect(effectiveRole(editor)).toBe('editor')
  })
})

describe('reading drafts', () => {
  it('denies anonymous, inactive and unknown roles (PERM-02)', () => {
    for (const a of [null, undefined, inactiveEditor, weird]) {
      expect(canReadDrafts(a).allowed).toBe(false)
    }
  })
  it('allows active Editors and Admins', () => {
    expect(canReadDrafts(editor).allowed).toBe(true)
    expect(canReadDrafts(admin).allowed).toBe(true)
  })
})

describe('creating content', () => {
  it('denies anonymous (PERM-01)', () => {
    expect(canCreateContent(null, draftSave).allowed).toBe(false)
  })
  it('denies an Editor creating a published record (PERM-04)', () => {
    expect(canCreateContent(editor, publishReq).allowed).toBe(false)
  })
  it('allows an Editor creating an explicit draft (PERM-05)', () => {
    expect(canCreateContent(editor, draftSave).allowed).toBe(true)
  })
  it('denies an Editor create with no explicit status', () => {
    expect(canCreateContent(editor, {}).allowed).toBe(false)
  })
  it('allows an Admin to create anything', () => {
    expect(canCreateContent(admin, publishReq).allowed).toBe(true)
  })
})

describe('updating content', () => {
  it('denies anonymous and inactive accounts (PERM-01, PERM-17)', () => {
    expect(canUpdateContent(null, draftSave).allowed).toBe(false)
    expect(canUpdateContent(inactiveEditor, draftSave).allowed).toBe(false)
    expect(canUpdateContent(inactiveAdmin, publishReq).allowed).toBe(false)
  })
  it('does NOT authorize an Editor because the saved record is a draft (PERM-06)', () => {
    const r = canUpdateContent(editor, { ...publishReq, existingStatus: 'draft' })
    expect(r.allowed).toBe(false)
  })
  it('denies an Editor re-publishing an already published record (PERM-06)', () => {
    const r = canUpdateContent(editor, { ...publishReq, existingStatus: 'published' })
    expect(r.allowed).toBe(false)
  })
  it('allows an Editor to save a draft over a published record (PERM-07)', () => {
    const r = canUpdateContent(editor, { ...draftSave, existingStatus: 'published' })
    expect(r.allowed).toBe(true)
  })
  it('denies an Editor update with no explicit status (PERM-08)', () => {
    expect(canUpdateContent(editor, { existingStatus: 'published' }).allowed).toBe(false)
    expect(canUpdateContent(editor, { existingStatus: 'draft' }).allowed).toBe(false)
  })
  it('denies an Editor claiming draft status without a draft save', () => {
    const r = canUpdateContent(editor, { incomingStatus: 'draft', savingAsDraft: false })
    expect(r.allowed).toBe(false)
  })
  it('denies an Editor unpublishing (PERM-09)', () => {
    const unpublish = {
      existingStatus: 'published',
      incomingStatus: 'draft',
      savingAsDraft: false,
    } as const
    expect(isUnpublish(unpublish)).toBe(true)
    expect(canUpdateContent(editor, unpublish).allowed).toBe(false)
  })
  it('does not treat a draft save over a published record as an unpublish', () => {
    expect(isUnpublish({ ...draftSave, existingStatus: 'published' })).toBe(false)
  })
  it('allows an Admin to publish and unpublish (PERM-15)', () => {
    expect(canUpdateContent(admin, publishReq).allowed).toBe(true)
    expect(
      canUpdateContent(admin, {
        existingStatus: 'published',
        incomingStatus: 'draft',
        savingAsDraft: false,
      }).allowed,
    ).toBe(true)
  })
})

describe('publish, delete and redirects', () => {
  it('only Admins publish (PERM-15)', () => {
    expect(canPublish(admin).allowed).toBe(true)
    expect(canPublish(editor).allowed).toBe(false)
    expect(canPublish(null).allowed).toBe(false)
  })
  it('only Admins delete content (PERM-10, PERM-15)', () => {
    expect(canDeleteContent(admin).allowed).toBe(true)
    expect(canDeleteContent(editor).allowed).toBe(false)
    expect(canDeleteContent(null).allowed).toBe(false)
  })
  it('only Admins write redirects (PERM-19)', () => {
    expect(canWriteRedirect(admin).allowed).toBe(true)
    expect(canWriteRedirect(editor).allowed).toBe(false)
    expect(canWriteRedirect(null).allowed).toBe(false)
  })
})

describe('user records', () => {
  it('denies anonymous reading any user (PERM-03)', () => {
    expect(canReadUser(null, 'a1').allowed).toBe(false)
  })
  it('lets an Editor read only their own record (PERM-14)', () => {
    expect(canReadUser(editor, 'e1').allowed).toBe(true)
    expect(canReadUser(editor, 'a1').allowed).toBe(false)
  })
  it('lets an Admin read any user', () => {
    expect(canReadUser(admin, 'e1').allowed).toBe(true)
  })
  it('only Admins create accounts (PERM-13)', () => {
    expect(canCreateUser(admin).allowed).toBe(true)
    expect(canCreateUser(editor).allowed).toBe(false)
    expect(canCreateUser(null).allowed).toBe(false)
  })

  const base: UserUpdate = {
    targetUserId: 'e1',
    changedFields: ['name'],
    targetCurrentRole: 'editor',
    targetCurrentActive: true,
    activeAdminCount: 2,
  }

  it('lets an Editor update own non-privileged fields', () => {
    expect(canUpdateUser(editor, base).allowed).toBe(true)
  })
  it('denies an Editor self-promoting (PERM-11)', () => {
    const r = canUpdateUser(editor, { ...base, changedFields: ['role'], newRole: 'admin' })
    expect(r.allowed).toBe(false)
  })
  it('denies an Editor changing own active flag', () => {
    const r = canUpdateUser(editor, { ...base, changedFields: ['active'], newActive: true })
    expect(r.allowed).toBe(false)
  })
  it('denies an Editor changing another user (PERM-12)', () => {
    const r = canUpdateUser(editor, {
      ...base,
      targetUserId: 'a1',
      changedFields: ['role'],
      newRole: 'editor',
      targetCurrentRole: 'admin',
    })
    expect(r.allowed).toBe(false)
  })
  it('denies anonymous and inactive accounts', () => {
    expect(canUpdateUser(null, base).allowed).toBe(false)
    expect(canUpdateUser(inactiveAdmin, base).allowed).toBe(false)
  })
  it('lets an Admin change roles when another Admin remains', () => {
    const r = canUpdateUser(admin, {
      ...base,
      changedFields: ['role'],
      newRole: 'admin',
    })
    expect(r.allowed).toBe(true)
  })
  it('denies demoting the last active Admin (PERM-16)', () => {
    const r = canUpdateUser(admin, {
      targetUserId: 'a1',
      changedFields: ['role'],
      newRole: 'editor',
      targetCurrentRole: 'admin',
      targetCurrentActive: true,
      activeAdminCount: 1,
    })
    expect(r.allowed).toBe(false)
  })
  it('denies deactivating the last active Admin (PERM-16)', () => {
    const r = canUpdateUser(admin, {
      targetUserId: 'a1',
      changedFields: ['active'],
      newActive: false,
      targetCurrentRole: 'admin',
      targetCurrentActive: true,
      activeAdminCount: 1,
    })
    expect(r.allowed).toBe(false)
  })
  it('allows demoting an Admin when two are active', () => {
    const r = canUpdateUser(admin2, {
      targetUserId: 'a1',
      changedFields: ['role'],
      newRole: 'editor',
      targetCurrentRole: 'admin',
      targetCurrentActive: true,
      activeAdminCount: 2,
    })
    expect(r.allowed).toBe(true)
  })
  it('protects the last Admin from deletion (PERM-16)', () => {
    const last = { id: 'a1', role: 'admin', active: true }
    expect(canDeleteUser(admin, last, 1).allowed).toBe(false)
    expect(canDeleteUser(admin, last, 2).allowed).toBe(true)
  })
  it('denies Editors deleting accounts', () => {
    expect(canDeleteUser(editor, { id: 'e1', role: 'editor', active: true }, 2).allowed).toBe(false)
  })
})
