import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex admin-root">
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="admin-mob-header md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10">
          <Link href="/admin">
            <Image src="/images/logo-1.png" alt="Dollar Shop" width={90} height={34} className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">Admin</span>
            <button type="button" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70" aria-label="Menu">
              <Menu size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
