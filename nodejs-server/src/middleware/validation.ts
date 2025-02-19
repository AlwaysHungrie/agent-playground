import { body, validationResult } from 'express-validator'
import express from 'express'
import createError from 'http-errors'

// Validation middleware
export const validateAgentAddress = [
  body('agentAddress')
    .trim()
    .isLength({ min: 42, max: 42 })
    .withMessage('Agent address must be 42 characters'),
]

export const validateAgentSystemPrompt = [  
  body('agentSystemPrompt')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Agent system prompt must be at least 100 characters'),
]

// Error handling middleware
export const handleValidationErrors = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    next(
      createError(400, 'Validation error', {
        errors: errors.array().map((err: any) => ({
          field: err.path,
          message: err.msg,
        })),
      })
    )
  }
  next()
}