import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatAddress } from '@/utils/formatting'
import CTAButton from '../cta'
import { Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import Instructions from './instructions'
import { Button } from '../ui/button'
import { LlmFunctionConfig } from '@/app/[userAddress]/page'
import FunctionForm from './functionForm'

export type AgentInfoProps = {
  addressInPath: string | undefined
  agentAddress: string
  agentSystemPrompt: string
  isOwner: boolean
  isSaving: boolean
  newAgent: boolean
  setAgentAddress: (address: string) => void
  setAgentSystemPrompt: (prompt: string) => void
  handleSave: () => void
  llmFunctions: LlmFunctionConfig[]
  setLlmFunctions: React.Dispatch<React.SetStateAction<LlmFunctionConfig[]>>
}

export default function AgentInfo({
  addressInPath,
  agentAddress,
  agentSystemPrompt,
  isOwner,
  isSaving,
  newAgent,
  setAgentAddress,
  setAgentSystemPrompt,
  handleSave,
  llmFunctions,
  setLlmFunctions,
}: AgentInfoProps) {
  const addNewFunction = () => {
    const newFunction: LlmFunctionConfig = {
      id: crypto.randomUUID(),
      name: 'New Function',
      description: 'Add a description for the function',
      parameters: {
        type: 'object',
        properties: [], // Now an array instead of an object
        required: []
      }
    };
    setLlmFunctions([...llmFunctions, newFunction]);
  };

  const updateLlmFunction = (updatedFunction: LlmFunctionConfig) => {
    setLlmFunctions(
      llmFunctions.map((f) =>
        f.id === updatedFunction.id ? updatedFunction : f
      )
    )
  }

  const deleteLlmFunction = (functionId: string) => {
    setLlmFunctions(llmFunctions.filter(f => f.id !== functionId));
  };

  return (
    <Card
      className={cn(
        newAgent
          ? 'bg-white'
          : 'bg-transparent border-none shadow-none rounded-none'
      )}
    >
      <CardHeader>
        <CardTitle
          className={`text-2xl ${newAgent ? 'text-center' : 'text-left'}`}
        >
          {formatAddress(addressInPath ?? '')}&apos;s Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-base">System Prompt</label>
          <Textarea
            className="min-h-40 resize-y bg-gray-100"
            value={agentSystemPrompt}
            onChange={(e) => setAgentSystemPrompt(e.target.value)}
            readOnly={!isOwner}
            placeholder="Enter system prompt..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-base">Autonomous Wallet Address</label>
          <Input
            className="bg-gray-100"
            value={agentAddress}
            onChange={(e) => setAgentAddress(e.target.value)}
            readOnly={!isOwner}
            placeholder="Enter wallet address..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-base flex items-center gap-2">
            Functions
            <Button
              onClick={addNewFunction}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Function
            </Button>
          </label>

          {llmFunctions.map((llmFunction) => (
            <FunctionForm
              key={llmFunction.name}
              llmFunction={llmFunction}
              updateLlmFunction={updateLlmFunction}
              onDelete={deleteLlmFunction}
            />
          ))}
        </div>

        <Instructions />

        {isOwner && (
          <div className="pt-4">
            <CTAButton
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center"
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
  )
}
