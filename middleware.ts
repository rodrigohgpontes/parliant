import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0-client";
import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/lib/actions/user-actions";
import { db } from "@/lib/db";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for webhook endpoint
  if (pathname === '/api/subscription/webhook') {
    return NextResponse.next();
  }

  const session = await auth0.getSession(request);
  const user = session?.user;

  // Let Auth0 handle all auth routes
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/auth/")) {
    return await auth0.middleware(request);
  }

  // If user is logged in
  if (user) {
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
    if (!isEmailVerified) {
      // Allow access to verification page, logout, and public pages
      if (pathname === "/verify-email" ||
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/signup") {
        return NextResponse.next();
      }
      // Redirect to verification page for protected routes
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }
  } else {
    // If user is not logged in and trying to access protected routes
    if (pathname.startsWith("/dashboard") || pathname === "/verify-email") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Only run middleware on dashboard routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/verify-email",
    "/verify-email/:path*",
    "/login",
    "/signup",
    "/api/auth/:path*",
    "/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo-small.png|api/subscription/webhook).*)"
  ]
};
