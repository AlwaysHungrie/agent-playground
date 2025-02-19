import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2 } from 'lucide-react'
import BotMessage from './botMessage'

export interface Message {
  id: number
  sender: 'user' | 'bot'
  isError: boolean
  text: string
  privateAttestation?: string
  publicAttestation?: string
}

const UserMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-primary text-primary-foreground rounded-t-lg rounded-bl-lg px-4 py-2 max-w-[80%]">
        {message.text}
      </div>
    </div>
  )
}

const ChatInterface = ({
  agentAddress,
}: {
  agentAddress: string | undefined
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      isError: false,
      text: 'Welcome to Agent Playground! This agent has a context window of only 1 message. Messages in this chat are not saved anywhere and will disappear when you refresh this page.',
    },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Create a ref for the scroll container
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // const simulateResponse = async () => {
  //   setIsLoading(true)
  //   await new Promise((resolve) => setTimeout(resolve, 1500))
  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       id: prev.length + 2,
  //       sender: 'bot',
  //       text: 'This is a simulated response to demonstrate the chat interaction.',
  //     },
  //   ])
  //   setIsLoading(false)
  // }

  const getResponse = useCallback(
    async (message: string) => {
      if (!agentAddress) {
        return
      }

      setIsLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/llm/${agentAddress}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        }
      )
      const data = await response.json()
      console.log(data)
      const { error, llm_response: llmResponsePublic = {}, attestation_url: publicAttestation } = data
      const { llm_response: llmResponse, attestation_url: privateAttestation } = llmResponsePublic

      let isError = false
      let reply = 'Unknown error occurred'

      if (llmResponsePublic && llmResponse && !error) {
        if (llmResponse.choices && llmResponse.choices[0].message) {
          reply = llmResponse.choices[0].message.content
        } else {
          isError = true
          reply = 'Agent did not generate a response'
        }
      } else {
        isError = true
        reply = 'Failed to get response from agent'
      }

      if (error) {
        console.error('Error fetching response from agent', error)
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: reply,
          isError,
          privateAttestation,
          publicAttestation,
        },
      ])
      setIsLoading(false)
    },
    [agentAddress]
  )

  const handleSend = useCallback(async () => {
    if (!newMessage.trim()) {
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        isError: false,
        text: newMessage.trim(),
      },
    ])
    setNewMessage('')
    await getResponse(newMessage)
  }, [newMessage, getResponse])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="w-full mx-auto h-screen flex flex-col rounded-none border-none bg-transparent">
      <ScrollArea className="flex-1 h-0 px-4 bg-transparent">
        <div className="py-4 space-y-4 max-w-3xl mx-auto w-full">
          {/* {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))} */}
          {messages.map((message) =>
            message.sender === 'user' ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <BotMessage key={message.id} message={message} />
            )
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2 flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardContent className="p-4 border-t bg-background mt-auto">
        <div className="flex gap-2">
          <Input
            placeholder={isLoading ? 'Please wait...' : 'Type your message...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatInterface
