"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    redirect("/dashboard");
  }

  useEffect(() => {
    if (!error) {
      window.location.href = `/auth/login?returnTo=${encodeURIComponent("/dashboard")}`;
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          {error === 'account_deleted' ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account Deleted</AlertTitle>
              <AlertDescription>
                This account has been deleted. Please contact support if you believe this is an error.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="mt-2 text-muted-foreground">
              Redirecting to login...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
