import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatAddress } from '@/utils/formatting'
import Link from 'next/link'
import CTAButton from '../cta'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}: AgentInfoProps) {
  return (
    <Card
      className={cn(
        newAgent && 'bg-white shadow-none rounded-none',
        'border-none'
      )}
    >
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
              Enter the same system prompt as above and use this site as this
              site i.e.{' '}
              <span className="font-xs bg-red-100 p-px rounded-md">
                https://playground.constella.one
              </span>
              . Make sure the system prompt and domain are exactly as above.
            </li>
            <li>
              For a given domain and system prompt, you can only generate one
              wallet address on Constella, so you will need to create a new
              account on playground to lauch another agent with same system
              prompt.
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
  )
}
