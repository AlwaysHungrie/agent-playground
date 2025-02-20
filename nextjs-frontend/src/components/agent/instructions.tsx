import Link from "next/link";

export default function Instructions() {
  return (
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
          Enter the same system prompt as above and use this site as the agent
          host i.e.{' '}
          <span className="font-xs bg-red-100 py-px px-2 rounded-md">
            https://playground.constella.one
          </span>
          . Make sure the system prompt and domain are exactly as above.
        </li>
        <li>
          For a given domain and system prompt, you can only generate one wallet
          address on Constella, so you will need to create a new account on
          playground to lauch another agent with same system prompt.
        </li>
        <li>
          Use the wallet address generated for you. You can also use the same
          wallet address if this agent was already registered.
        </li>
      </ol>
    </div>
  )
}
