import { getAppSettings } from "@/lib/app-settings";
import { StoreInfoForm } from "../../_components/settings/StoreInfoForm";

export const metadata = { title: "Store Info — Super Admin" };

export default async function StoreInfoSettingsPage() {
  const settings = await getAppSettings();
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Store Info</h1>
        <p className="text-sm text-slate-500 mt-1">
          App name, footer copyright, and the contact details shown in the store footer.
        </p>
      </div>
      <StoreInfoForm initialSettings={settings} />
    </div>
  );
}
