import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { getSession } from "@auth0/nextjs-auth0"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  )
}
