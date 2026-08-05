"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, Store, ChevronRight, Shield, UserCircle } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { SETTINGS_SECTIONS } from "./settings/nav";

const navItems = [
  { href: "/super-admin/settings", label: "App Settings", icon: Settings },
  { href: "/super-admin/account", label: "My Account", icon: UserCircle },
  { href: "/", label: "View Store", icon: Store },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const inSettings = pathname.startsWith("/super-admin/settings");

  return (
    <aside
      className="max-md:hidden flex flex-col overflow-y-auto w-64 shrink-0"
      style={{ background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)" }}
    >
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center ring-1 ring-violet-500/30">
          <Shield size={22} className="text-violet-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white">Super Admin</p>
          <p className="text-[10px] text-violet-400/70 font-semibold tracking-widest uppercase mt-0.5">Developer Panel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <p className="text-[10px] text-white/35 font-medium">Elevated access</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5">
        <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest px-3 mb-3">Menu</p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isSettings = href === "/super-admin/settings";
            const isActive = isSettings
              ? pathname === href
              : pathname.startsWith(href) && href !== "/" && href !== "/admin";
            return (
              <div key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative overflow-hidden group
                    ${isActive
                      ? "bg-violet-600/20 text-violet-300"
                      : "text-white/55 hover:bg-white/6 hover:text-white/85"
                    }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-violet-400 rounded-r-full" />
                  )}
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors ${isActive ? "text-violet-400" : "group-hover:text-white/80"}`}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={13} className="text-white/30 shrink-0" />}
                </Link>

                {/* Settings sub-sections */}
                {isSettings && inSettings && (
                  <div className="mt-1 mb-1 ml-6 pl-3 border-l border-white/10 space-y-0.5">
                    {SETTINGS_SECTIONS.map((section) => {
                      const subActive = pathname === section.href;
                      return (
                        <Link
                          key={section.href}
                          href={section.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                            ${subActive ? "bg-white/8 text-white" : "text-white/45 hover:bg-white/5 hover:text-white/75"}`}
                        >
                          <section.icon size={14} className={`shrink-0 ${subActive ? "text-violet-400" : ""}`} />
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/8">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/40 hover:bg-white/8 hover:text-white/80 transition-colors"
          >
            <LogOut size={15} className="shrink-0" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
