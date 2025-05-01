import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSession } from "@auth0/nextjs-auth0"
import { ThemeToggle } from "@/components/theme-toggle"

export async function DashboardHeader() {
  const session = await getSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <span className="text-xl font-bold">Parliant.AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="text-sm">{session?.user?.name || session?.user?.email}</div>
          <Link href="/api/auth/logout">
            <Button variant="outline" size="sm">
              Log out
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
