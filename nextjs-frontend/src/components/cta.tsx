'use client'

import Link from "next/link"

const commonClasses = "mx-auto w-full px-2 whitespace-nowrap sm:px-4 text-[#05D505] cursor-pointer text-sm mt-auto p-2 rounded-md border border-[#004400] bg-[#001800] hover:bg-[#05D505] hover:text-[#001800] transition-all duration-300 ease-in-out text-center disabled:opacity-50 disabled:cursor-not-allowed"

export default function CTAButton({
  children,
  onClick,
  disabled,
  asLink,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  asLink?: string
  className?: string
}) {
  if (asLink) {
    return (
      <Link href={asLink} className={`${commonClasses} ${className}`}>
        {children}
      </Link>
    )
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${commonClasses} ${className}`}
    >
      {children}
    </button>
  )
}

