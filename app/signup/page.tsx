"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function SignupPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    redirect("/dashboard");
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = `/auth/login?returnTo=${encodeURIComponent("/dashboard")}&screen_hint=signup`;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-muted-foreground">
            Redirecting to signup...
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
