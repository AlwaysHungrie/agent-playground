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

export default {
  PORT,
  JWT_SECRET,
  PRIVY_PUBLIC_KEY,
  PRIVY_APP_SECRET,
  PRIVY_APP_ID,
  RUST_BINARY_PATH,
  OPENAI_API_KEY,
}
