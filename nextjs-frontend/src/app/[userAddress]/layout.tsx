import { UserInfo } from "@/components/userInfo"
export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 relative">
      <UserInfo />
      {children}
    </div>
  )
}