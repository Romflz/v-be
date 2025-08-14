import { Request, Response } from 'express'
import { upsertUser } from '../models/userModel'

export async function syncUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const user = await upsertUser({
    uid: req.user.uid,
    name: req.user.name || 'Unknown',
    email: req.user.email || null,
    picture: req.user.picture || null,
    emailVerified: req.user.email_verified || false,
    signInProvider: req.user.firebase?.sign_in_provider || null,
    tenant: req.user.firebase?.tenant || null,
  })

  return res.json({ user })
}
