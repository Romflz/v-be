import { Request, Response, NextFunction } from 'express'
import { verifyIdToken } from '../config/firebase'
import type { DecodedIdToken } from 'firebase-admin/auth'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || ''
    const match = /^Bearer (.+)$/.exec(auth)
    if (!match) return res.status(401).json({ error: 'Missing bearer token' })
    const decoded = (await verifyIdToken(match[1]!)) as DecodedIdToken
    ;(req as any).user = decoded
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
