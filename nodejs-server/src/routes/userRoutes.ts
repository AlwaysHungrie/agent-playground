import express from 'express'
import { AuthenticatedRequest, jwtMiddleware } from '../middleware/jwt'
import { asyncHandler } from '../middleware/misc'
import { getUserByAddress, getUserById } from '../services/userService'
import createError from 'http-errors'

const router = express.Router()

router.get(
  '/',
  jwtMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const user = await getUserById(req.user.id)
    if (!user) {
      throw createError(404, 'User not found')
    }
    res.json({ user })
  })
)

router.get(
  '/:address',
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const user = await getUserByAddress(req.params.address)
    if (!user) {
      throw createError(404, 'User not found')
    }
    res.json({ user, success: true })
  })
)

export default router
