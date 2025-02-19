'use client'

import { UserContext } from '@/providers/userProvider'
import { formatAddress } from '@/utils/formatting'
import { usePrivy } from '@privy-io/react-auth'
import { useContext, useEffect } from 'react'

export const UserInfo = () => {
  const { user, clearUser, getToken } = useContext(UserContext)
  const { user: privyUser, logout, login, authenticated } = usePrivy()
  const privyAddress = privyUser?.wallet?.address

  const address = user?.address || privyUser?.wallet?.address

  const handleLogout = () => {
    clearUser()
    logout()
  }

  useEffect(() => {
    if (!address || !authenticated) return
    getToken(address)
  }, [address, authenticated, getToken])

  const renderContent = () => {
    if (!user?.address || user?.address !== privyAddress) {
      return (
        <div className="flex items-center gap-1 flex-col">
          <div className="bg-black text-white px-4 py-2 rounded-full">
            Not Connected
          </div>
          <div
            onClick={() => {
              login()
            }}
            className="cursor-pointer text-xs"
          >
            Connect Wallet
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 flex-col">
        <div className="bg-black text-white px-4 py-2 rounded-full">
          {formatAddress(user?.address)}
        </div>
        <div onClick={handleLogout} className="cursor-pointer text-xs">
          Logout
        </div>
      </div>
    )
  }

  return <div className="absolute top-4 right-4">{renderContent()}</div>
}
