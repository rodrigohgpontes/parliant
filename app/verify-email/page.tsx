"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const { user, isLoading, error, invalidate } = useUser();
    const router = useRouter();
    const [logoutUrl, setLogoutUrl] = useState<string>("/auth/logout");
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        console.log('Auth state:', { user, isLoading, error });

        if (error || (!isLoading && !user)) {
            console.log('Authentication issue, redirecting to home');
            router.replace("/");
            return;
        }

        // Check email verification status immediately when user data is available
        if (user && !isLoading) {
            console.log('Checking initial email verification status:', user.email_verified);
            if (user.email_verified) {
                console.log('Email already verified, redirecting to dashboard');
                router.replace("/dashboard");
                return;
            }
        }

        setLogoutUrl(`/auth/logout?returnTo=${encodeURIComponent(window.location.origin)}`);

        // Set up polling to check email verification status
        const checkEmailVerification = async () => {
            try {
                console.log('Polling: Checking email verification status...');
                const updatedUser = await invalidate();
                console.log('Polling: Updated user data:', updatedUser?.email_verified);
                if (updatedUser?.email_verified) {
                    console.log('Polling: Email verified, redirecting to dashboard');
                    router.replace("/dashboard");
                }
            } catch (error) {
                console.error('Error checking session:', error);
            }
        };

        // Check immediately and then every 5 seconds
        checkEmailVerification();
        const intervalId = setInterval(checkEmailVerification, 5000);

        return () => clearInterval(intervalId);
    }, [user, isLoading, error, router, invalidate]);

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