import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SETTINGS_SECTIONS, TONE_CLASSES } from "../_components/settings/nav";

export const metadata = { title: "App Settings — Super Admin" };

export default function SuperAdminSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">App Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pick a section to configure. Changes apply globally in real time once saved.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SETTINGS_SECTIONS.map(({ href, label, icon: Icon, tone, summary }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-violet-300 hover:shadow-sm p-5 flex items-start gap-4 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{summary}</p>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-300 shrink-0 mt-0.5 group-hover:text-violet-500 transition-colors"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
