import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center bg-background">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-lg text-foreground">Page not found</p>
      <p className="mt-4 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Link href="/" className="mt-6">
        <Button>Go back home</Button>
      </Link>
    </div>
  )
}
