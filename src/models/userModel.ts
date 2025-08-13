import { db } from '../db/client'
import { users, type User } from '../db/schema'
import { eq } from 'drizzle-orm'

//Find a user by their Firebase UID
export async function findUserByUid(uid: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.uid, uid)).limit(1)
  return rows[0]
}

//Input type for upserting a user - matches what comes from Firebase Auth
interface UpsertUserInput {
  uid: string
  name: string
  email?: string | null
  picture?: string | null
  emailVerified?: boolean
  signInProvider?: string | null
  tenant?: string | null
  role?: 'client' | 'provider'
  lastLoginAt?: Date
}

//Create or update a user - simple sync from Firebase Auth

export async function upsertUser(data: UpsertUserInput): Promise<User> {
  const existing = await findUserByUid(data.uid)
  const now = new Date()

  if (!existing) {
    // Create new user
    const inserted = await db
      .insert(users)
      .values({
        uid: data.uid,
        name: data.name,
        email: data.email ?? undefined,
        picture: data.picture ?? undefined,
        emailVerified: data.emailVerified ?? false,
        signInProvider: data.signInProvider ?? undefined,
        tenant: data.tenant ?? undefined,
        role: data.role ?? 'client',
        lastLoginAt: data.lastLoginAt ?? now,
        verificationStatus: 'pending',
      })
      .returning()

    return inserted[0]!
  }

  // Update existing user
  const updated = await db
    .update(users)
    .set({
      name: data.name,
      email: data.email ?? undefined,
      picture: data.picture ?? undefined,
      emailVerified: data.emailVerified ?? existing.emailVerified,
      signInProvider: data.signInProvider ?? existing.signInProvider,
      tenant: data.tenant ?? existing.tenant,
      role: data.role ?? existing.role,
      lastLoginAt: data.lastLoginAt ?? now,
      updatedAt: now,
    })
    .where(eq(users.id, existing.id))
    .returning()

  return updated[0]!
}
