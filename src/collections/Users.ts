/**
 * Private CMS accounts (Editors and Admins). NOT the public club-member list:
 * public people live in People/Memberships.
 *
 * STATUS: written against Payload 3.x but NOT RUN (P01 foundation is not merged).
 * All decisions are delegated to src/access/policy.ts, which has unit tests.
 * Invite-only: only an Admin can create accounts; there is no public registration.
 * Password changes use the approved recovery flow (provider PENDING orchestrator).
 */
import type { Access, CollectionConfig, FieldAccess } from 'payload'
import {
  canCreateUser,
  canDeleteUser,
  canReadUser,
  canUpdateUser,
  effectiveRole,
  type Actor,
} from '../access/policy'

type StaffUser = { id: string | number; role?: string; active?: boolean } | null | undefined

const toActor = (user: StaffUser): Actor =>
  user ? { id: String(user.id), role: user.role ?? '', active: user.active === true } : null

const isAdminUser = (user: StaffUser) => effectiveRole(toActor(user)) === 'admin'

/** Anonymous and inactive accounts get nothing; Editors are limited to their own record. */
const readAccess: Access = ({ req }) => {
  const actor = toActor(req.user as StaffUser)
  const role = effectiveRole(actor)
  if (!role) return false
  if (role === 'admin') return true
  return { id: { equals: actor!.id } } // an Editor reads only their own record
}

const createAccess: Access = ({ req }) => canCreateUser(toActor(req.user as StaffUser)).allowed

/**
 * Collection-level update: decided from the INCOMING data keys.
 * The activeAdminCount here is a placeholder (Infinity = no last-Admin check):
 * last-Admin protection is a separate, atomic step (N1-U4) and is NOT claimed here.
 */
const updateAccess: Access = ({ req, id, data }) => {
  const actor = toActor(req.user as StaffUser)
  if (!actor || id === undefined) return false
  const changedFields = Object.keys((data as Record<string, unknown>) ?? {})
  return canUpdateUser(actor, {
    targetUserId: String(id),
    changedFields,
    newRole: (data as { role?: string } | undefined)?.role,
    newActive: (data as { active?: boolean } | undefined)?.active,
    targetCurrentRole: 'unknown',
    targetCurrentActive: true,
    activeAdminCount: Number.POSITIVE_INFINITY,
  }).allowed
}

const deleteAccess: Access = ({ req, id }) =>
  id !== undefined &&
  canDeleteUser(
    toActor(req.user as StaffUser),
    { id: String(id), role: 'unknown', active: true },
    Number.POSITIVE_INFINITY,
  ).allowed

/** Field-level guard so role/active can never be written by a non-Admin, whatever the route. */
const adminOnlyField: FieldAccess = ({ req }) => isAdminUser(req.user as StaffUser)

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // recovery/forgot-password stays off until a club-owned email provider is approved
  admin: { useAsTitle: 'email' },
  access: {
    create: createAccess,
    read: readAccess,
    update: updateAccess,
    delete: deleteAccess,
  },
  fields: [
    // Exact name must match EDITOR_SELF_EDITABLE_USER_FIELDS in src/access/policy.ts.
    { name: 'displayName', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Editor', value: 'editor' },
        { label: 'Admin', value: 'admin' },
      ],
      access: { create: adminOnlyField, update: adminOnlyField },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      access: { create: adminOnlyField, update: adminOnlyField },
    },
  ],
}
