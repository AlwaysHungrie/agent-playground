'use client'

import PrivyProvider from '@/providers/privy'
import { UserProvider } from '@/providers/userProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider>
      <UserProvider>{children}</UserProvider>
    </PrivyProvider>
  )
}
