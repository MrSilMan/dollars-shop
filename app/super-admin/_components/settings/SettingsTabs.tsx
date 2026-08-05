"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_SECTIONS } from "./nav";

/**
 * Section switcher for viewports where the sidebar is hidden — the sidebar
 * carries the same links on desktop.
 */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="md:hidden -mx-5 sm:-mx-7 mb-5 px-5 sm:px-7 overflow-x-auto">
      <div className="flex gap-2 w-max">
        <Link
          href="/super-admin/settings"
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            pathname === "/super-admin/settings"
              ? "bg-violet-600 text-white"
              : "bg-white border border-slate-200 text-slate-600"
          }`}
        >
          Overview
        </Link>
        {SETTINGS_SECTIONS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              pathname === href ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
