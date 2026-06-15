import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaff, adminLandingPage } from "@/lib/permissions";
import { getAppSettings } from "@/lib/app-settings";
import { LoginContent } from "./_components/LoginContent";

export default async function LoginPage() {
  const [session, settings] = await Promise.all([auth(), getAppSettings()]);

  if (session?.user) {
    const role = (session.user as { role?: string })?.role ?? "";
    redirect(isStaff(role) ? adminLandingPage(role) : "/account");
  }

  return <LoginContent logoUrl={settings.logoUrl} appName={settings.appName} />;
}
