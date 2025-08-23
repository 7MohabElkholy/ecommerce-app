// middleware.js
import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin paths
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (user.user_metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Prevent logged-in admin from opening login page
  if (
    req.nextUrl.pathname === "/login" &&
    user &&
    user.user_metadata?.role === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
