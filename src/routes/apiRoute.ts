import { Router } from 'express'
import { syncUser } from '../controllers/syncController'
import { authMiddleware } from '../middlewares/auth'

const router = Router()

// Is hit on every login. This is basically login/register
router.post('/users/sync', authMiddleware, syncUser)

export default router
