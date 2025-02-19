import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const PRIVY_PUBLIC_KEY = process.env.PRIVY_PUBLIC_KEY || "secret";
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET || "secret";
const PRIVY_APP_ID = process.env.PRIVY_APP_ID || "secret";

export default { PORT, JWT_SECRET, PRIVY_PUBLIC_KEY, PRIVY_APP_SECRET, PRIVY_APP_ID };
