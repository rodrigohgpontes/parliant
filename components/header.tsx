'use client';

import { Navigation } from "@/components/nav";
import { MobileMenu } from "@/components/mobile-menu";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Header() {
    const showNavigation = usePathname() === "/";

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image src="/logo-small.png" alt="Parliant.AI logo" width={32} height={32} />
                    <span className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Parliant.AI</span>
                </div>
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
                <Navigation />
                <MobileMenu />
            </div>
        </header>
    );
} 