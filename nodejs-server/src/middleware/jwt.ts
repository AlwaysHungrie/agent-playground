import express from 'express'
import { Prisma } from '@prisma/client'
import jwt from 'jsonwebtoken'
import config from '../config'
import createError from 'http-errors'

const { JWT_SECRET } = config

export type AuthenticatedRequest = express.Request & {
  user: {
    id: string
  }
}

// JWT middleware
export const jwtMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw createError(401, 'Unauthorized')
  }

  const decoded = jwt.verify(token, JWT_SECRET)
  if (
    !decoded ||
    typeof decoded !== 'object' ||
    !decoded.id
  ) {
    throw createError(401, 'Unauthorized')
  }

  ;(req as AuthenticatedRequest).user = {
    id: decoded.id,
  }
  next()
}

export const privyJwtMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    throw createError(401, 'Unauthorized')
  }

  const decoded = jwt.verify(token, JWT_SECRET)
  console.log('decoded', decoded)
  next()
}

export const issueJWT = (
  user: Prisma.UserGetPayload<{
    select: {
      id: true
    }
  }>
) => {
  const payload = {
    id: user.id,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}
