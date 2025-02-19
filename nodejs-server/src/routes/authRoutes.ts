import express from 'express'
import { asyncHandler } from '../middleware/misc'
import { privyJwtMiddleware } from '../middleware/jwt'

const router = express.Router()

// Route handlers
router.get(
  '/token',
  privyJwtMiddleware,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    res.status(200).json({
      success: true,
      message: 'Token generated successfully',
    })
  })
)


export default router
