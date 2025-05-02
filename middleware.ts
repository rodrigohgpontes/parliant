import type { NextRequest } from "next/server";
import { auth0 } from "@/lib/auth0-client";
import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/lib/actions/user-actions";

export async function middleware(request: NextRequest) {
  const session = await auth0.getSession(request);
  const user = session?.user;
  const pathname = request.nextUrl.pathname;

  // Let Auth0 handle all auth routes
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/auth/")) {
    return await auth0.middleware(request);
  }

  // If user is logged in
  if (user) {
    // Create or update user in our database
    await createOrUpdateUser(user);

    // Check if email is verified
    if (!user.email_verified) {
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

    // If user is on public pages, redirect to dashboard
    if (!pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else {
    // If user is not logged in and trying to access verify-email page
    if (pathname === "/verify-email") {
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
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
};
