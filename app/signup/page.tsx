"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";

export default function SignupPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-muted-foreground">
            Sign up to get started with Parliant.AI
          </p>
        </div>
        <div className="mt-8">
          <a
            href="/auth/login"
            className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign up with Auth0
          </a>
        </div>
      </div>
    </div>
  );
}
