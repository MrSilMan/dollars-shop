import { getAppSettings } from "@/lib/app-settings";
import { PaymentsForm } from "../../_components/settings/PaymentsForm";

export const metadata = { title: "Payments — Super Admin" };

export default async function PaymentsSettingsPage() {
  const settings = await getAppSettings();
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <p className="text-sm text-slate-500 mt-1">Currency conversion used when a customer settles EcoCash in ZiG.</p>
      </div>
      <PaymentsForm initialSettings={settings} />
    </div>
  );
}
