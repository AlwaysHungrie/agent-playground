'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCallback, useEffect } from 'react'
import CTAButton from './cta'
import { DialogContent } from './dialog'

export const RegisterWallet = ({}: {
  setDialog: (dialog: DialogContent) => void
}) => {
  const { logout, user, login, authenticated, getAccessToken } = usePrivy()

  const address = user?.wallet?.address

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
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }, [getAccessToken])

  // const registerWallet = useCallback(
  //   async (address: string, domain: string, systemPrompt: string) => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.NEXT_PUBLIC_WALLET_HOST}/register/wallet`,
  //         {
  //           method: 'POST',
  //           body: JSON.stringify({ address, domain, systemPrompt }),
  //         }
  //       )

  //       const data = await response.json()
  //       console.log(data)
  //       if (data.error === 'Wallet already exists') {
  //         setDialog({
  //           TITLE: 'agent-found',
  //           CONTENT: `An agent with this domain and system prompt already exists. It's wallet address is ${data.address}. Use a different domain or system prompt to register a new agent.`,
  //         })

  //         return
  //       }

  //       setDialog({
  //         TITLE: 'agent-created',
  //         CONTENT: `A wallet has been created for your agent. It's wallet address is ${data.address}. You can now use the registered domain to send attestations and use this wallet.`,
  //       })
  //     } catch (error) {
  //       console.log(error)
  //       if (
  //         error instanceof Error &&
  //         error.message === 'Wallet already exists'
  //       ) {
  //         console.log('Wallet already exists')
  //       }
  //     }
  //   },
  //   [setDialog]
  // )

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
            onClick={() => {
              // if (!domain || !systemPrompt) {
              //   return
              // }
              // registerWallet(address, domain, systemPrompt)
            }}
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
      {user?.wallet?.address && (
        <div className="absolute bottom-[-24px] right-0">
          <div className="flex flex-col text-xs font-bold w-full">
            <div className="cursor-pointer" onClick={logout}>
              ⦿ Disconnect Wallet
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
