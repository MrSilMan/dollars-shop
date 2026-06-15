import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaff, adminLandingPage } from "@/lib/permissions";
import { mergeGuestCart } from "@/actions/cart";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fallback = searchParams.get("fallback") ?? "/";

  const session = await auth();
  const role = (session?.user as { role?: string })?.role ?? "";

  console.log("[admin-redirect] session:", JSON.stringify({ exists: !!session, role, email: session?.user?.email }));

  // Merge any guest cart items into the user's account. This runs during full-page
  // navigation so the session cookie is guaranteed to be present — unlike calling it
  // from a client-side server action right after signIn(). Also covers Google sign-in,
  // which never called mergeGuestCart() before.
  if (session?.user?.id) {
    await mergeGuestCart();
  }

  if (session && isStaff(role)) {
    return NextResponse.redirect(new URL(adminLandingPage(role), process.env.AUTH_URL!));
  }

  return NextResponse.redirect(new URL(fallback, process.env.AUTH_URL!));
}
