'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCallback, useContext, useEffect } from 'react'
import CTAButton from './cta'
import { DialogContent } from './dialog'
import { UserContext } from '@/providers/userProvider'

export const RegisterWallet = ({}: {
  setDialog: (dialog: DialogContent) => void
}) => {
  const { user, clearUser, getToken } = useContext(UserContext)
  const { logout, user: privyUser, login, authenticated } = usePrivy()

  const address = user?.address || privyUser?.wallet?.address

  const handleLogout = useCallback(() => {
    clearUser()
    logout()
  }, [clearUser, logout])

  useEffect(() => {
    if (!address || !authenticated) return
    getToken(address)
  }, [address, authenticated, getToken])

  return (
    <div className="relative my-4 flex-1 flex flex-col justify-center aspect-[16/9] w-[400px] max-w-[90vw] mx-auto px-2 sm:px-4">
      <div className="relative border rounded-lg p-4 backdrop-blur-[2px] flex flex-col h-full overflow-y-auto bg-white">
        <div className="text-2xl font-bold text-center">
          Constella Wallet Playground v0.0.1
          <br />
        </div>

        <div className="opacity-80 text-sm my-auto py-6">
          Welcome to Constella,
          <br />
          <br />
          Constella is a verifiably autonomous wallet for AI agents. A wallet
          once registered can only be controlled by decisions made by an agent
          and is not accessible to the agent&apos;s owners or Constella.
          <br />
          <br />
          This is a playground to create your own agents and test wallet
          interactions. For production, create a fork of{' '}
          <a
            href="https://github.com/AlwaysHungrie/agent-playground"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            this repo
          </a>{' '}
          and deploy to your own domain to create a truly autonomous agent
          secured by Constella.
          <br />
          <br />
          <ul>
            {[
              {
                title: 'Create',
                description: 'your own agent in a few clicks',
              },
              {
                title: 'Find and Interact',
                description:
                  'with agents built by other users at <a href="https://x.com/constella.one" target="_blank" rel="noopener noreferrer" style="color: blue; text-decoration: underline;">x.com/constella.one</a>',
              },
            ].map((item, index) => (
              <li key={index} className="list-disc list-inside mb-2">
                <span className="font-bold">{item.title}</span>{' '}
                <span dangerouslySetInnerHTML={{ __html: item.description }} />
              </li>
            ))}
          </ul>
          <br />
          {!address && (
            <span className="italic">
              <>&lt;connect your wallet to get started&gt;</>
            </span>
          )}
        </div>

        {authenticated && address ? (
          <CTAButton
            asLink={`/${address}`}
            onClick={() => {}}
          >
            Create Agent
          </CTAButton>
        ) : (
          <CTAButton
            onClick={() => {
              login()
            }}
          >
            Connect Wallet
          </CTAButton>
        )}
      </div>
      {address && (
        <div className="absolute bottom-[-24px] right-0">
          <div className="flex flex-col text-xs font-bold w-full">
            <div className="cursor-pointer" onClick={handleLogout}>
              ⦿ Disconnect Wallet
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
