import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "./_components/AdminShell";
import { getAppSettings } from "@/lib/app-settings";
import { isStaff } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let session: any;
  try {
    session = await auth();
  } catch (err) {
    process.stderr.write(`[admin-layout] auth() threw: ${err}\n`);
    redirect("/login");
    return null;
  }
  const role = (session?.user as { role?: string })?.role ?? "";
  process.stderr.write(`[admin-layout] session: ${JSON.stringify({ exists: !!session, role, email: session?.user?.email })}\n`);
  if (!session || !isStaff(role)) redirect("/login");
  const settings = await getAppSettings();
  const logoSrc = settings.logoUrl ?? "/images/logo-1.png";

  return <AdminShell logoSrc={logoSrc} role={role}>{children}</AdminShell>;
}
