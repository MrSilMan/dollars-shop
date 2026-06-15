"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ logoSrc, role, children }: { logoSrc: string; role: string; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden flex admin-root">
      <AdminSidebar
        logoSrc={logoSrc}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay — sits below the sidebar, above content */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="admin-mob-header md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-white/10">
          <Link href="/admin">
            <Image src={logoSrc} alt="Dollar Shop" width={90} height={34} className="h-8 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-white/40 tracking-widest uppercase">Admin</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/70"
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-7 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
