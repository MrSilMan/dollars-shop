import { getAppSettings } from "@/lib/app-settings";
import { AppSettingsPanel } from "../_components/AppSettingsPanel";

export const metadata = { title: "App Settings — Super Admin" };

export default async function SuperAdminSettingsPage() {
  const settings = await getAppSettings();
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">App Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Customize colors, logo, app info, and typography. Changes apply globally in real time.</p>
      </div>
      <AppSettingsPanel initialSettings={settings} />
    </div>
  );
}
