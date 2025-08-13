import { db } from '../db/client'
import { users, businesses, type User, type NewUser, type Business, userRoleEnum } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function findUserByUid(uid: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1)
  return rows[0]
}

interface UpsertUserInput {
  uid: string
  name: string
  email?: string | null
  picture?: string | null
  emailVerified?: boolean
  signInProvider?: string | null
  tenant?: string | null
  role?: 'user' | 'business'
  lastLoginAt?: Date
}

export async function upsertUser(data: UpsertUserInput): Promise<User> {
  const existing = await findUserByUid(data.uid)
  const now = new Date()
  if (!existing) {
    const inserted = await db
      .insert(users)
      .values({
        uid: data.uid,
        name: data.name,
        email: data.email ?? null,
        picture: data.picture ?? null,
        emailVerified: data.emailVerified ?? false,
        signInProvider: data.signInProvider ?? null,
        tenant: data.tenant ?? null,
        role: data.role ?? 'user',
        lastLoginAt: data.lastLoginAt ?? now,
        updatedAt: now,
      })
      .returning()
    return inserted[0]!
  }

  const updated = await db
    .update(users)
    .set({
      name: data.name,
      email: data.email ?? null,
      picture: data.picture ?? null,
      emailVerified: data.emailVerified ?? false,
      signInProvider: data.signInProvider ?? null,
      tenant: data.tenant ?? null,
      role: data.role ?? existing.role,
      lastLoginAt: data.lastLoginAt ?? now,
      updatedAt: now,
    })
    .where(eq(users.id, existing.id))
    .returning()
  return updated[0]!
}

export async function ensureBusinessProfile(user: User): Promise<Business | undefined> {
  if (user.role !== 'business') return undefined
  const rows = await db.select().from(businesses).where(eq(businesses.userId, user.id)).limit(1)
  if (rows[0]) return rows[0]
  const inserted = await db
    .insert(businesses)
    .values({ userId: user.id, name: user.name, contactEmail: user.email ?? undefined })
    .returning()
  return inserted[0]
}
