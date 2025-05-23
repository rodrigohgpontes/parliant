import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0-client";
import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/lib/actions/user-actions";
import { db } from "@/lib/db";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Let Auth0 handle all auth routes without session checks
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/auth/")) {
    return await auth0.middleware(request);
  }

  // Only check session for protected routes
  if (pathname.startsWith("/dashboard") || pathname === "/verify-email") {
    let session;
    try {
      session = await auth0.getSession(request);
    } catch (error) {
      console.error('Session error:', error);
      // Clear the session cookie and redirect to home
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('appSession');
      return response;
    }

    const user = session?.user;

    // If no user, redirect to home
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Create or update user in our database
    await createOrUpdateUser(user);

    // Get latest user data from Auth0 Management API
    let isEmailVerified = user.email_verified;
    try {
      const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${user.sub}`, {
        headers: {
          'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userProfile = await response.json();
        isEmailVerified = userProfile.email_verified;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }

    // Check if email is verified
    if (!isEmailVerified && pathname !== "/verify-email") {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }
  }

  return NextResponse.next();
}

// Update matcher to only run on specific routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/verify-email",
    "/api/auth/:path*",
    "/auth/:path*"
  ]
};
