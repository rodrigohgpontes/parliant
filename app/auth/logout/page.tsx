"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to Auth0 logout endpoint
        window.location.href = "/auth/logout";
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
                <p className="text-muted-foreground">Please wait while we log you out.</p>
            </div>
        </div>
    );
} 