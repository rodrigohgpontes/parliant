"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardHeader() {
  const { user } = useUser();

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
          <div className="text-sm">{user?.name || user?.email}</div>
          <Link href="/auth/logout">
            <Button variant="outline" size="sm">
              Log out
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
