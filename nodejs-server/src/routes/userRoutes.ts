import express from 'express'
import { AuthenticatedRequest, jwtMiddleware } from '../middleware/jwt'
import { asyncHandler } from '../middleware/misc'
import { getUserByAddress } from '../services/userService'
import createError from 'http-errors'
import { body } from 'express-validator'
import { handleValidationErrors } from '../middleware/validation'
import prisma from '../prisma'

const router = express.Router()

router.post( 
  '/agentInfo',
  jwtMiddleware,
  body('agentAddress')
    .isString()
    .isLength({ min: 42, max: 42 })
    .withMessage('Agent address must be 42 characters long'),
  body('agentSystemPrompt')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Agent system prompt must be at least 10 characters long'),
  body('agentFunctions')
    .optional()
    .isArray()
    .withMessage('Agent functions must be an array'),
  handleValidationErrors,
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { agentAddress, agentSystemPrompt, agentFunctions } = req.body
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { agentAddress, agentSystemPrompt, agentFunctions: JSON.stringify(agentFunctions) },
    })
    res.json({ success: true, updatedUser })
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
