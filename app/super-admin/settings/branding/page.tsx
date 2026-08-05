import { getAppSettings } from "@/lib/app-settings";
import { BrandingForm } from "../../_components/settings/BrandingForm";

export const metadata = { title: "Branding — Super Admin" };

export default async function BrandingSettingsPage() {
  const settings = await getAppSettings();
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Branding</h1>
        <p className="text-sm text-slate-500 mt-1">The logo shown in the store header and the browser tab favicon.</p>
      </div>
      <BrandingForm initialSettings={settings} />
    </div>
  );
}
