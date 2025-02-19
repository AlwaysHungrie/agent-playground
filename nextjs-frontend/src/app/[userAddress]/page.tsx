'use client'

import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { formatAddress } from '@/utils/formatting'
import CTAButton from '@/components/cta'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function UserPage() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [agentNotFound, setAgentNotFound] = useState(false)
  const [agentAddress, setAgentAddress] = useState('')
  const [agentSystemPrompt, setAgentSystemPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [newAgent, setNewAgent] = useState(false)

  const { user } = usePrivy()
  const address = user?.wallet?.address
  const addressInPath = useMemo(() => pathname.split('/').pop(), [pathname])
  const isOwner = useMemo(
    () => addressInPath === address,
    [addressInPath, address]
  )

  const getAgent = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${addressInPath}`
      )
      const data = await response.json()
      const { success, agentAddress, agentSystemPrompt } = data

      if (!success) {
        setAgentNotFound(true)
        return
      }

      if (!agentAddress) {
        setNewAgent(true)
      }

      setAgentAddress(agentAddress)
      setAgentSystemPrompt(agentSystemPrompt)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [addressInPath])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Add your save logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated save
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    getAgent()
  }, [getAgent])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (agentNotFound) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-4">
            <div className="text-center flex flex-col gap-4">
              <p>Unable to find an agent for this account.</p>
              <p className="text-gray-600">
                Visit the home page if you are the owner of this address.
              </p>
              <CTAButton asLink="/" className="mt-2" onClick={() => {}}>
                Back to Home
              </CTAButton>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {formatAddress(addressInPath ?? '')}&apos;s Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-base">System Prompt</label>
              <Textarea
                className="min-h-40 resize-y"
                value={agentSystemPrompt}
                onChange={(e) => setAgentSystemPrompt(e.target.value)}
                readOnly={!isOwner}
                placeholder="Enter system prompt..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-base">Autonomous Wallet Address</label>
              <Input
                value={agentAddress}
                onChange={(e) => setAgentAddress(e.target.value)}
                readOnly={!isOwner}
                placeholder="Enter wallet address..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-base">
                Follow these steps to get an autonomous wallet address:
              </label>
              <ol className="list-decimal pl-5 text-sm">
                <li>
                  Visit{' '}
                  <Link
                    href="https://constella.one"
                    target="_blank"
                    className="text-blue-500"
                  >
                    Constella
                  </Link>{' '}
                  and connect your wallet which was used to create this page.
                </li>
                <li>
                  Enter the same system prompt as above and use this site as
                  this site i.e.{' '}
                  <span className="font-xs bg-red-100 p-px rounded-md">
                    https://playground.constella.one
                  </span>
                  . Make sure the system prompt and domain are exactly as above.
                </li>
                <li>
                  For a given domain and system prompt, you can only generate
                  one wallet address on Constella, so you will need to create a
                  new account on playground to lauch another agent with same
                  system prompt.
                </li>
                <li>
                  Use the wallet address generated for you. You can also use the
                  same wallet address if this agent was already registered.
                </li>
              </ol>
            </div>

            {isOwner && (
              <div className="pt-4">
                <CTAButton
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : newAgent ? (
                    'Create Agent'
                  ) : (
                    'Save Changes'
                  )}
                </CTAButton>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
