'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";
import { usePathname } from "next/navigation";

export function Navigation() {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const isRespondingToSurvey = pathname?.includes("surveys/");

    return (
        <div className="hidden md:flex items-center gap-4">
            {isLoading ? null : user ? (
                <>
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm">
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/subscription">
                        <Button variant="outline" size="sm">
                            Subscription
                        </Button>
                    </Link>
                    <Link href="/auth/logout" prefetch={false}>
                        <Button variant="ghost" size="sm">
                            Log out
                        </Button>
                    </Link>
                </>
            ) : isRespondingToSurvey ? (
                <a href="/" target="_blank" rel="noopener noreferrer">
                    <Button size="sm">
                        Create Your Own Survey
                    </Button>
                </a>
            ) : (
                <>
                    <Link href="/login">
                        <Button variant="outline" size="sm">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/signup">
                        <Button size="sm">Get started—it's free</Button>
                    </Link>
                </>
            )}
        </div>
    );
} 