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

    // For email verification, trust the session data first, but also check our database
    let isEmailVerified = user.email_verified;

    // If not verified in session, check our database for the latest state
    if (!isEmailVerified) {
      try {
        const dbUser = await db`
          SELECT is_email_verified FROM users WHERE auth0_id = ${user.sub}
        `;
        if (dbUser.length > 0) {
          isEmailVerified = dbUser[0].is_email_verified;
        }
      } catch (error) {
        console.error('Error checking database user verification:', error);
      }
    }

    // Only redirect to verify-email if user is definitely not verified
    if (!isEmailVerified && pathname !== "/verify-email") {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    // If user is verified but on verify-email page, redirect to dashboard
    if (isEmailVerified && pathname === "/verify-email") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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
