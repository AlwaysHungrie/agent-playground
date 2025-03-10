'use client'

import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import CTAButton from '@/components/cta'
import { Card, CardContent } from '@/components/ui/card'
import { UserContext } from '@/providers/userProvider'
import AgentInfo from '@/components/agent/agentInfo'
import ChatInterface from '@/components/chat/chatInterface'
import { UserInfo } from '@/components/userInfo'
import Link from 'next/link'
import { HiHome } from 'react-icons/hi'

// "functions": [
//     {
//       "name": "send_eth",
//       "description": "Sends test ETH to the specified Ethereum address",
//       "parameters": {
//         "type": "object",
//         "properties": {
//           "address": {
//             "type": "string",
//             "description": "Valid Ethereum address starting with 0x"
//           },
//           "amount": {
//             "type": "number",
//             "description": "Amount of test ETH to send (cannot exceed 0.05)"
//           }
//         },
//         "required": ["address", "amount"]
//       }
//     }
//   ],

// Convert from object format back to JSON format
function convertLlmFunctionsToJson(
  objectFunctions: LlmFunctionConfig[]
): JsonLlmFunction[] {
  return objectFunctions.map((objFunc) => {
    // Convert the properties array to an object
    const properties: { [key: string]: { type: string; description: string; } } =
      {}
    objFunc.parameters.properties.forEach((prop) => {
      properties[prop.name] = {
        type: prop.type,
        description: prop.description,
      }
    })

    const required = objFunc.parameters.properties.map((prop) => {
      return prop.isRequired ? prop.name : null
    }).filter((prop) => prop !== null)

    return {
      name: objFunc.name,
      description: objFunc.description,
      parameters: {
        type: "object",
        properties,
        required,
      },
    }
  })
}

const parseLlmFunctionsJson = (jsonFunctions: JsonLlmFunction[]): LlmFunctionConfig[] => {
  return jsonFunctions.map((jsonFunc) => {
    // Convert the properties object to an array of properties
    const properties = Object.entries(jsonFunc.parameters.properties).map(
      ([name, prop]) => ({
        name,
        type: prop.type,
        description: prop.description,
        isRequired: jsonFunc.parameters.required.includes(name)
      })
    );

    return {
      id: crypto.randomUUID(),
      name: jsonFunc.name,
      description: jsonFunc.description,
      parameters: {
        type: jsonFunc.parameters.type,
        properties,
        required: jsonFunc.parameters.required
      }
    };
  });
}

export interface LlmFunctionConfig {
  id: string
  name: string
  description: string
  parameters: LlmFunctionParameters
}

export interface LlmFunctionParameters {
  type: string
  properties: LlmFunctionProperty[]
}

export interface LlmFunctionProperty {
  type: string
  description: string
  name: string
  isRequired: boolean
}

type JsonLlmFunction = {
  name: string;
  description: string;
  parameters: {
      type: string;
      properties: {
          [key: string]: {
              type: string;
              description: string;
          };
      };
      required: (string)[];
  };
}

export default function UserPage() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [agentNotFound, setAgentNotFound] = useState(false)

  const [agentAddress, setAgentAddress] = useState('')
  const [agentSystemPrompt, setAgentSystemPrompt] = useState('')
  const [agentFunctions, setAgentFunctions] = useState<LlmFunctionConfig[]>([])

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
      const { success, user: { agentAddress, agentSystemPrompt, agentFunctions } = {} } = data

      const parsedFunctions = parseLlmFunctionsJson(JSON.parse(agentFunctions))
      console.log('parsed functions', parsedFunctions)

      if (!success) {
        console.log('agent not found')
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
      setAgentFunctions(parsedFunctions)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [addressInPath])

  const saveAgentInfo = useCallback(async () => {
    try {
      const jsonFunctions = convertLlmFunctionsToJson(agentFunctions)
      const body = {
        agentAddress,
        agentSystemPrompt,
        agentFunctions: jsonFunctions,
      }

      console.log('body', body)

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
  }, [agentAddress, agentSystemPrompt, agentFunctions, user])

  const handleSave = useCallback(async () => {
    console.log('handle save')

    // const jsonFunctions = convertLlmFunctionsToJson(agentFunctions)
    // console.log('json functions', jsonFunctions)

    // const parsedFunctions = parseLlmFunctionsJson(jsonFunctions)
    // console.log('parsed functions', parsedFunctions)

    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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

  if (agentNotFound || (newAgent && !isOwner)) {
    return (
      <div className="flex justify-center items-center h-screen p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="p-4">
            <div className="text-center flex flex-col gap-4">
              <p>Unable to find an agent for this account.</p>
              <p className="text-gray-600">
                If you are the owner of this address, visit the home page and
                connect your wallet.
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
            llmFunctions={agentFunctions}
            setLlmFunctions={setAgentFunctions}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      <div className="max-w-sm mx-auto h-full overflow-y-auto bg-white">
        <div className="w-full flex items-center gap-4 px-4 py-4 border-b border-gray-200 bg-gray-100">
          <Link
            href="/"
            className="mr-auto bg-gray-200 rounded-full p-2 hover:bg-gray-300 text-[#004400]"
          >
            <HiHome className="w-4 h-4" />
          </Link>
          <UserInfo />
        </div>
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
          llmFunctions={agentFunctions}
          setLlmFunctions={setAgentFunctions}
        />
      </div>
      <div className="flex-1 flex flex-col gap-4 h-full">
        <ChatInterface agentAddress={addressInPath} />
      </div>
    </div>
  )
}
