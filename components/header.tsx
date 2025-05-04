'use client';

import { Navigation } from "@/components/nav";
import { MobileMenu } from "@/components/mobile-menu";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0";

interface HeaderProps {
    showAuth?: boolean;
}

export function Header({ showAuth = true }: HeaderProps) {
    const pathname = usePathname();
    const { user } = useUser();
    const showNavigation = pathname === "/";
    const isPublicSurvey = pathname.includes("/surveys/") && pathname.includes("/public");

    // Skip auth checks for public survey pages
    if (isPublicSurvey) {
        return (
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo-small.png" alt="Parliant.AI logo" width={32} height={32} />
                        <span className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Parliant.AI</span>
                    </Link>
                    <Link href="/" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                            Create Your Own AI Survey
                        </Button>
                    </Link>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between">
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                    <Image src="/logo-small.png" alt="Parliant.AI logo" width={32} height={32} />
                    <span className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Parliant.AI</span>
                </Link>
                {showNavigation && (
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="#what-is-it" className="text-sm font-medium hover:text-primary">
                            What is it
                        </a>
                        <a href="#benefits" className="text-sm font-medium hover:text-primary">
                            Benefits
                        </a>
                        <a href="#pricing" className="text-sm font-medium hover:text-primary">
                            Pricing
                        </a>
                    </nav>
                )}
                {showAuth && <Navigation />}
                <MobileMenu showAuth={showAuth} />
            </div>
        </header>
    );
} 