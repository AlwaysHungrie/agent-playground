import { createContext, useState } from 'react'

export type User = {
  jwt: string
  address: string
}

export const UserContext = createContext<{
  user: User | null
  setUser: (user: User | null) => void
}>({
  user: null,
  setUser: () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
