import { usePrivy } from '@privy-io/react-auth'
import { createContext, useCallback, useEffect, useState } from 'react'

export type User = {
  jwt: string
  address: string
}

export const UserContext = createContext<{
  user: User | null
  saveUser: (user: User) => void
  clearUser: () => void
  getToken: (address: string) => Promise<void>
}>({
  user: null,
  saveUser: () => {},
  clearUser: () => {},
  getToken: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const { getAccessToken } = usePrivy()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      setUser(JSON.parse(user))
    }
  }, [])

  const saveUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }, [])

  const clearUser = useCallback(() => {
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const getToken = useCallback(async (address: string) => {
    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('No token found')
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/token?address=${address}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      saveUser({ jwt: data.token, address })
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }, [getAccessToken, saveUser])

  return (
    <UserContext.Provider value={{ user, saveUser, clearUser, getToken }}>
      {children}
    </UserContext.Provider>
  )
}
