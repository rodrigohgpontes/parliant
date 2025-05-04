"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useUser } from "@auth0/nextjs-auth0";

interface MobileMenuProps {
  showAuth?: boolean;
}

export function MobileMenu({ showAuth = true }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useUser();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Parliant.AI</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-6">
          <Link href="#what-is-it" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              What is it
            </Button>
          </Link>
          <Link href="#benefits" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Benefits
            </Button>
          </Link>
          <Link href="#pricing" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Pricing
            </Button>
          </Link>
          <div className="flex items-center justify-between pt-4">
            <ThemeToggle />
            {showAuth && (
              <div className="flex gap-2">
                {isLoading ? null : user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/auth/logout" onClick={() => setOpen(false)}>
                      <Button variant="ghost" size="sm">
                        Log out
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setOpen(false)}>
                      <Button size="sm">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
