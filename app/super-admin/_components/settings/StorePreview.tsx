"use client";

import { Eye, MapPin, Phone, Mail, Clock } from "lucide-react";
import type { AppSettingsData } from "@/lib/app-settings";

/** Sticky wrapper so a preview keeps pace with a long form column. */
export function PreviewPanel({ title = "Live Preview", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="sticky top-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={15} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-700">{title}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StorePreview({
  settings,
  showTabTitle = false,
  showFontScale = false,
}: {
  settings: AppSettingsData;
  showTabTitle?: boolean;
  showFontScale?: boolean;
}) {
  const logoSrc = settings.logoUrl ?? "/images/logo-1.png";

  return (
    <>
      <div
        className="rounded-xl overflow-hidden border border-slate-100"
        style={{ background: settings.bgColor, color: settings.textColor }}
      >
        {/* Navbar mockup */}
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b border-black/5"
          style={{ background: "#FEF3C7" }}
        >
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="logo" className="h-6 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-5 rounded-full" style={{ background: settings.primaryColor, opacity: 0.15 }} />
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: settings.primaryColor }}
            >
              <span className="text-[7px] text-white font-bold">3</span>
            </div>
          </div>
        </div>

        {/* Hero mockup */}
        <div
          className="px-3 py-4 flex flex-col gap-1"
          style={{ background: `linear-gradient(135deg, ${settings.primaryColor}22, ${settings.accentColor}22)` }}
        >
          <div className="w-16 h-2 rounded-full" style={{ background: settings.accentColor }} />
          <div className="w-28 h-3 rounded-full" style={{ background: settings.textColor, opacity: 0.8 }} />
          <div className="w-20 h-2 rounded-full mt-0.5" style={{ background: settings.textColor, opacity: 0.4 }} />
          <div
            className="mt-2 w-16 h-6 rounded-lg flex items-center justify-center"
            style={{ background: settings.primaryColor }}
          >
            <span className="text-[9px] text-white font-bold">Shop Now</span>
          </div>
        </div>

        {/* Products grid mockup */}
        <div className="px-3 py-3 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-black/5 overflow-hidden" style={{ background: "white" }}>
              <div className="h-10" style={{ background: `${settings.primaryColor}15` }} />
              <div className="p-1.5 space-y-1">
                <div className="w-full h-1.5 rounded-full" style={{ background: settings.textColor, opacity: 0.3 }} />
                <div className="w-2/3 h-2 rounded-full" style={{ background: settings.primaryColor }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer mockup */}
        <div className="px-3 py-2.5" style={{ background: settings.primaryColor }}>
          <div className="w-20 h-1.5 rounded-full bg-white/40 mb-1.5" />
          <div className="space-y-1 mb-1.5">
            {settings.contactAddress && (
              <div className="flex gap-1 items-start text-[8px] text-white/70">
                <MapPin size={8} className="shrink-0 mt-px" />
                <span className="truncate">{settings.contactAddress}</span>
              </div>
            )}
            {settings.contactPhone && (
              <div className="flex gap-1 items-center text-[8px] text-white/70">
                <Phone size={8} className="shrink-0" />
                <span className="truncate">{settings.contactPhone}</span>
              </div>
            )}
            {settings.contactEmail && (
              <div className="flex gap-1 items-center text-[8px] text-white/70">
                <Mail size={8} className="shrink-0" />
                <span className="truncate">{settings.contactEmail}</span>
              </div>
            )}
            {settings.contactHours && (
              <div className="flex gap-1 items-start text-[8px] text-white/70">
                <Clock size={8} className="shrink-0 mt-px" />
                <span className="whitespace-pre-line">{settings.contactHours}</span>
              </div>
            )}
          </div>
          <div className="text-[8px] text-white/50 truncate border-t border-white/10 pt-1">{settings.footerText}</div>
        </div>
      </div>

      {showTabTitle && (
        <div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl">
          <p className="text-[10px] text-slate-400 font-medium">Browser tab title</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
            {settings.appName} — Shop More. Save More.
          </p>
        </div>
      )}

      {showFontScale && (
        <div className="mt-2 px-3 py-2 bg-slate-50 rounded-xl flex items-baseline gap-3">
          <span style={{ fontSize: "0.6rem", color: settings.textColor }}>Aa</span>
          <span style={{ fontSize: "0.75rem", color: settings.textColor }}>Aa</span>
          <span style={{ fontSize: "1rem", color: settings.textColor }}>Aa</span>
          <p className="text-[9px] text-slate-400 ml-auto">
            {settings.fontScale === "SMALL" ? "14px" : settings.fontScale === "LARGE" ? "18px" : "16px"} base
          </p>
        </div>
      )}
    </>
  );
}
