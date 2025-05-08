"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    redirect("/dashboard");
  }

  useEffect(() => {
    window.location.href = `/auth/login?returnTo=${encodeURIComponent("/dashboard")}`;
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    </div>
  );
}
