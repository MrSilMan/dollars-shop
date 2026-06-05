import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminShell } from "./_components/AdminShell";
import { getAppSettings } from "@/lib/app-settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || (role !== "ADMIN" && role !== "SUPER_ADMIN")) redirect("/login");
  const settings = await getAppSettings();
  const logoSrc = settings.logoUrl ?? "/images/logo-1.png";

  return <AdminShell logoSrc={logoSrc}>{children}</AdminShell>;
}
