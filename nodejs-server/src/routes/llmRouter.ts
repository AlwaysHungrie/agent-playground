import express from 'express'
import { exec } from 'child_process'
import config from '../config'
import { getUserByAddress } from '../services/userService'
import { asyncHandler } from '../middleware/misc'
import { handleValidationErrors } from '../middleware/validation'
import { body } from 'express-validator'

const llmRouter = express.Router()

const {
  RUST_BINARY_PATH,
  OPENAI_API_KEY,
  BACKEND_URL,
  NOTARY_HOST,
  NOTARY_PORT,
  NOTARY_TLS,
} = config

// Types
interface ExecuteRequestBody {
  apiKey: string
  llmRequest: Record<string, any>
  userDir: string
  outputPrefix: string
  url: string
}

interface MessageRequestBody {
  message: string
}

// Helper functions
const executeRustCommand = (command: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Rust program: ${error}`)
        reject(new Error(`Failed to execute Rust program: ${error.message}`))
        return
      }

      try {
        const parsedOutput = JSON.parse(stdout.trim())
        resolve(parsedOutput)
      } catch (parseError) {
        console.error(`Error parsing Rust output: ${parseError}`)
        reject(new Error('Failed to parse Rust program output'))
      }
    })
  })
}

const sanitizeJsonString = (jsonString: string): string => {
  if (!jsonString) {
    return ''
  }

  // base64 encode the json string
  const base64Encoded = Buffer.from(jsonString).toString('base64')
  return base64Encoded
}

const buildRustCommand = (
  url: string,
  headers: Record<string, string>,
  requestJson: Record<string, any>,
  userDir: string,
  outputPrefix: string,
  privateWords: string
): string => {
  return (
    [
      RUST_BINARY_PATH,
      '--url',
      `'${url}'`,
      '--headers',
      `'${JSON.stringify(headers)}'`,
      '--request-json',
      `'${sanitizeJsonString(JSON.stringify(requestJson))}'`,
      '--user-dir',
      userDir,
      '--output-prefix',
      outputPrefix,
      '--notary-host',
      NOTARY_HOST,
      '--notary-port',
      NOTARY_PORT.toString(),
      '--private-words',
      privateWords,
    ].join(' ') + (NOTARY_TLS ? ' --notary-tls' : '')
  )
}

// Route handlers
llmRouter.post(
  '/execute',
  body('url').isString().isLength({ min: 1 }),
  body('apiKey').isString().isLength({ min: 1 }),
  body('llmRequest').isObject(),
  body('userDir').isString().isLength({ min: 1 }),
  body('outputPrefix').isString().isLength({ min: 1 }),
  handleValidationErrors,
  asyncHandler(
    async (
      req: express.Request<{}, {}, ExecuteRequestBody>,
      res: express.Response
    ) => {
      try {
        const { url, apiKey, llmRequest, userDir, outputPrefix } = req.body
        console.log('req.body', req.body)

        if (!apiKey || !llmRequest || !url || !userDir || !outputPrefix) {
          res.status(400).json({
            error:
              'Missing required parameters: apiKey, llmRequest, url, userDir, and outputPrefix are required',
          })
          return
        }

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        }
        const command = buildRustCommand(
          url,
          headers,
          llmRequest,
          userDir,
          outputPrefix,
          `${OPENAI_API_KEY}`
        )

        console.log('command', command)

        const result = await executeRustCommand(command)
        res.json(result)
      } catch (err) {
        console.error(`Server error: ${err}`)
        res.status(500).json({
          error: 'Internal server error',
          details: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
  )
)

llmRouter.post(
  '/:agentOwnerAddress/message',
  body('message')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Message is required'),
  handleValidationErrors,
  asyncHandler(async (req: express.Request, res: express.Response) => {
    try {
      const user = await getUserByAddress(req.params.agentOwnerAddress)
      if (!user || !user.agentSystemPrompt || !user.agentAddress) {
        res.status(404).json({
          error: 'Agent not found',
        })
        return
      }

      const { message } = req.body

      if (!message) {
        res.status(400).json({
          error: 'Missing required parameters: message',
        })
        return
      }

      const userDir = user.agentAddress
      const outputPrefix = `${userDir}-${Date.now()}`
      const outputPrefixPrivate = `${userDir}-private-${Date.now()}`

      // this is a request to be made to llm provider
      const llmRequest: any = {
        messages: [
          { role: 'system', content: user.agentSystemPrompt },
          { role: 'user', content: message },
        ],
        model: 'gpt-4o-mini',
        max_tokens: 1000,
      }

      if (user.agentFunctions) {
        llmRequest.functions = JSON.parse(user.agentFunctions)
        llmRequest.function_call = 'auto'
      }

      // this is a request to be made to the execute endpoint
      const executeRequest = {
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: OPENAI_API_KEY,
        llmRequest,
        userDir,
        outputPrefix: outputPrefixPrivate,
      }

      const headers = { 'Content-Type': 'application/json' }
      const command = buildRustCommand(
        `${BACKEND_URL}/api/v1/llm/execute`,
        headers,
        executeRequest,
        userDir,
        outputPrefix,
        `${OPENAI_API_KEY}`
      )

      console.log('running command', command)

      const result = await executeRustCommand(command)
      res.json(result)
    } catch (err) {
      console.error(`Server error: ${err}`)
      res.status(500).json({
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  })
)

export default llmRouter
