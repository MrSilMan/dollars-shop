import { getAppSettings } from "@/lib/app-settings";
import { LoginContent } from "./_components/LoginContent";

export default async function LoginPage() {
  const settings = await getAppSettings();
  return <LoginContent logoUrl={settings.logoUrl} appName={settings.appName} />;
}
