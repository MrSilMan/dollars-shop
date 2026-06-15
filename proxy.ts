import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isStaff } from "@/lib/permissions";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as { role?: string })?.role;

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, req.url));
    }
    if (!isStaff(role ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (nextUrl.pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${nextUrl.pathname}`, req.url));
    }
  }

  const res = NextResponse.next();
  if (!req.cookies.get("cart_session")) {
    res.cookies.set("cart_session", randomUUID(), {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
