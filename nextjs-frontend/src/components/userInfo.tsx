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
        <div className="flex items-center">
        <div className="px-4 py-2 border text-sm border-[#004400] bg-[#001800] text-white rounded-l-md">
          Not Connected
        </div>
        <div 
          onClick={() => {
            login()
          }}
          className="whitespace-nowrap px-4 py-2 cursor-pointer text-xs rounded-r-md border-t border-b border-r border-transparent bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-[#001800] transition-all duration-300 ease-in-out text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect Wallet
        </div>
      </div>
      )
    }
    return (
      <div className="flex items-center">
        <div className="px-4 py-2 border text-sm border-[#004400] bg-[#001800] text-white rounded-l-md">
          {formatAddress(user?.address)}
        </div>
        <div 
          onClick={handleLogout}
          className="whitespace-nowrap px-4 py-2 cursor-pointer text-xs rounded-r-md border-t border-b border-r border-transparent bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-[#001800] transition-all duration-300 ease-in-out text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Logout
        </div>
      </div>
    )
  }

  return (
    <>
      {renderContent()}
    </>
  )
}
