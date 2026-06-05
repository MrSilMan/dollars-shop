import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Menu } from "lucide-react";
import Link from "next/link";
import { SuperAdminSidebar } from "./_components/SuperAdminSidebar";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="h-screen overflow-hidden flex" style={{ background: "#0F172A" }}>
      <SuperAdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10"
          style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)" }}>
          <span className="text-sm font-bold text-white">Super Admin</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-violet-400/60 tracking-widest uppercase">Developer</span>
            <button type="button"
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70"
              aria-label="Menu">
              <Menu size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
