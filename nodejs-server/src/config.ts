import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const PRIVY_PUBLIC_KEY = process.env.PRIVY_PUBLIC_KEY || 'secret'
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || 'secret'
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || 'secret'

const RUST_BINARY_PATH = process.env.RUST_BINARY_PATH
if (!RUST_BINARY_PATH) {
  throw new Error('RUST_BINARY_PATH is not set')
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
if (!AWS_ACCESS_KEY_ID) {
  throw new Error('AWS_ACCESS_KEY_ID is not set')
}
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
if (!AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS_SECRET_ACCESS_KEY is not set')
}
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

const NOTARY_HOST = process.env.NOTARY_HOST || '0.0.0.0'
const NOTARY_PORT = process.env.NOTARY_PORT || 7047
const NOTARY_TLS = process.env.NOTARY_TLS === 'true' || false

export default {
  PORT,
  JWT_SECRET,
  PRIVY_PUBLIC_KEY,
  PRIVY_APP_SECRET,
  PRIVY_APP_ID,
  RUST_BINARY_PATH,
  OPENAI_API_KEY,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  FRONTEND_URL,
  BACKEND_URL,
  NOTARY_HOST,
  NOTARY_PORT,
  NOTARY_TLS,
}
