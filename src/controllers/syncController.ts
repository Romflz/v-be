import { Request, Response } from 'express'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { upsertUser, ensureBusinessProfile } from '../models/userModel'

export async function syncUser(req: Request, res: Response) {
  const decoded = (req as any).user as DecodedIdToken | undefined
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const saved = await upsertUser({
    uid: decoded.uid,
    name: decoded.name || 'Unknown',
    email: decoded.email || null,
    picture: decoded.picture || null,
    emailVerified: decoded.email_verified || false,
    signInProvider: decoded.firebase?.sign_in_provider || null,
    tenant: decoded.firebase?.tenant || null,
  })

  const business = await ensureBusinessProfile(saved)

  return res.json({ user: saved, business })
}
