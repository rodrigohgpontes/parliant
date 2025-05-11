"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const { user, isLoading, error } = useUser();
    const router = useRouter();
    const [logoutUrl, setLogoutUrl] = useState<string>("/auth/logout");
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (error || (!isLoading && !user)) {
            router.replace("/");
            return;
        }

        // Check email verification status immediately when user data is available
        if (user && !isLoading) {
            if (user.is_email_verified || user.email_verified) {
                router.replace("/dashboard");
                return;
            }
        }

        setLogoutUrl(`/auth/logout?returnTo=${encodeURIComponent(window.location.origin)}`);

        // Set up polling to check email verification status
        const checkEmailVerification = async () => {
            try {
                if (isRedirecting) return; // Prevent multiple redirects

                console.log('Polling: Checking email verification status...');
                // Force a session refresh
                const response = await fetch('/api/auth/refresh', { method: 'POST' });
                if (!response.ok) {
                    throw new Error('Failed to refresh session');
                }
                const profileResponse = await fetch('/api/auth/profile');
                if (!profileResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }
                const updatedUser = await profileResponse.json();
                if (updatedUser?.email_verified) {
                    console.log('Polling: Email verified, redirecting to dashboard');
                    setIsRedirecting(true);
                    clearInterval(intervalId);
                    router.push('/dashboard', { scroll: false });
                    // Force a hard navigation if the router.push doesn't work
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        };

        // Check immediately and then every 5 seconds
        checkEmailVerification();
        const intervalId = setInterval(checkEmailVerification, 5000);

        return () => clearInterval(intervalId);
    }, [user, isLoading, error, router, isRedirecting]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="text-center p-6">
                        <p className="text-muted-foreground">Loading authentication state...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return null; // Will be redirected by useEffect
    }

    const handleLogout = () => {
        window.location.href = logoutUrl;
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-center text-2xl">Verify your email</CardTitle>
                    <CardDescription className="text-center">
                        Please verify your email address to continue using Parliant.AI
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground">
                        We've sent a verification email to:
                    </p>
                    <div className="mt-2 rounded-lg bg-primary/5 p-3">
                        <p className="font-medium text-primary">{user?.email}</p>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                        Please check your inbox and click the verification link.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        This page will automatically redirect you once your email is verified.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="outline" onClick={handleLogout}>
                        Log out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
} 