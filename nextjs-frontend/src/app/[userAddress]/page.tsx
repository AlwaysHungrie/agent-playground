'use client'

import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import CTAButton from '@/components/cta'
import { Card, CardContent } from '@/components/ui/card'
import { UserContext } from '@/providers/userProvider'
import AgentInfo from '@/components/agent/agentInfo'

export default function UserPage() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [agentNotFound, setAgentNotFound] = useState(false)
  const [agentAddress, setAgentAddress] = useState('')
  const [agentSystemPrompt, setAgentSystemPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [newAgent, setNewAgent] = useState(false)

  const { user } = useContext(UserContext)
  const { user: privyUser } = usePrivy()
  const address = privyUser?.wallet?.address
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
      console.log('get agent data', data)
      const {
        success,
        user: { agentAddress, agentSystemPrompt },
      } = data

      if (!success) {
        setAgentNotFound(true)
        return
      }

      if (!agentAddress) {
        setNewAgent(true)
      }

      console.log('agent address', agentAddress)
      console.log('agent system prompt', agentSystemPrompt)

      setAgentAddress(agentAddress ?? '')
      setAgentSystemPrompt(agentSystemPrompt ?? '')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [addressInPath])

  const saveAgentInfo = useCallback(async () => {
    try {
      const body = {
        agentAddress,
        agentSystemPrompt,
      }

      console.log(body)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/agentInfo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.jwt}`,
          },
          body: JSON.stringify(body),
        }
      )
      const data = await response.json()
      const { success, updatedUser } = data

      if (!success || !updatedUser) {
        throw new Error('Failed to save agent info')
      }

      setAgentAddress(updatedUser?.agentAddress)
      setAgentSystemPrompt(updatedUser?.agentSystemPrompt)
      setNewAgent(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [agentAddress, agentSystemPrompt, user])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await saveAgentInfo()
    } finally {
      setIsSaving(false)
    }
  }, [saveAgentInfo])

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

  if (newAgent) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <AgentInfo
            addressInPath={addressInPath}
            agentAddress={agentAddress}
            agentSystemPrompt={agentSystemPrompt}
            isOwner={isOwner}
            isSaving={isSaving}
            newAgent={newAgent}
            setAgentAddress={setAgentAddress}
            setAgentSystemPrompt={setAgentSystemPrompt}
            handleSave={handleSave}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="max-w-sm mx-auto h-screen overflow-y-auto">
        <AgentInfo
          addressInPath={addressInPath}
          agentAddress={agentAddress}
          agentSystemPrompt={agentSystemPrompt}
          isOwner={isOwner}
          isSaving={isSaving}
          newAgent={newAgent}
          setAgentAddress={setAgentAddress}
          setAgentSystemPrompt={setAgentSystemPrompt}
          handleSave={handleSave}
        />
      </div>
      <div className="flex-1 flex flex-col gap-4 bg-red-500">
        <div className="flex-1"></div>
        <div className="flex-1"></div>
      </div>
    </div>
  )
}
