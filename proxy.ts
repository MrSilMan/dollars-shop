import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;

  if (pathname.startsWith("/admin")) {
    if (!token || (token.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=/account`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
