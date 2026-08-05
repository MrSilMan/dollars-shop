import { getAppSettings } from "@/lib/app-settings";
import { AppearanceForm } from "../../_components/settings/AppearanceForm";

export const metadata = { title: "Appearance — Super Admin" };

export default async function AppearanceSettingsPage() {
  const settings = await getAppSettings();
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Appearance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Brand colors and global font size. Colors preview instantly on this page.
        </p>
      </div>
      <AppearanceForm initialSettings={settings} />
    </div>
  );
}
