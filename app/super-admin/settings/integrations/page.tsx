import { getAppSettings } from "@/lib/app-settings";
import { IntegrationsForm } from "../../_components/settings/IntegrationsForm";

export const metadata = { title: "Integrations — Super Admin" };

export default async function IntegrationsSettingsPage() {
  const settings = await getAppSettings();
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">External services wired into the store.</p>
      </div>
      <IntegrationsForm initialSettings={settings} />
    </div>
  );
}
