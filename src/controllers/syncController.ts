import { Request, Response } from 'express'
import type { DecodedIdToken } from 'firebase-admin/auth'

export async function syncUser(req: Request, res: Response) {
  const decoded = (req as any).user as DecodedIdToken | undefined
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const user = {
    uid: decoded.uid,
    email: decoded.email || null,
    emailVerified: decoded.email_verified || false,
    name: decoded.name || null,
    picture: decoded.picture || null,
    issuer: decoded.iss,
    authTime: decoded.auth_time ? new Date(decoded.auth_time * 1000).toISOString() : null,
    signInProvider: decoded.firebase?.sign_in_provider || null,
    tenant: decoded.firebase?.tenant || null,
    customClaims: Object.fromEntries(
      Object.entries(decoded).filter(([k]) => !['uid', 'email', 'email_verified', 'name', 'picture', 'iss', 'aud', 'auth_time', 'exp', 'iat', 'sub', 'firebase'].includes(k))
    ),
  }

  console.log(user)
  return res.json({ user })
}
