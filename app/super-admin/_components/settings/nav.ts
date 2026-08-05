import { Palette, ImageIcon, Info, Coins, MessageCircle } from "lucide-react";

export type SettingsTone = "violet" | "blue" | "emerald" | "teal" | "green" | "amber" | "sky" | "orange";

export const TONE_CLASSES: Record<SettingsTone, string> = {
  violet: "bg-violet-50 text-violet-600",
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  teal: "bg-teal-50 text-teal-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  orange: "bg-orange-50 text-orange-600",
};

export const SETTINGS_SECTIONS = [
  {
    href: "/super-admin/settings/appearance",
    label: "Appearance",
    icon: Palette,
    tone: "violet" as SettingsTone,
    summary: "Brand colors and the global font size scale",
  },
  {
    href: "/super-admin/settings/branding",
    label: "Branding",
    icon: ImageIcon,
    tone: "blue" as SettingsTone,
    summary: "Store logo and browser tab favicon",
  },
  {
    href: "/super-admin/settings/store-info",
    label: "Store Info",
    icon: Info,
    tone: "emerald" as SettingsTone,
    summary: "App name, footer copyright, contact details and socials",
  },
  {
    href: "/super-admin/settings/payments",
    label: "Payments",
    icon: Coins,
    tone: "teal" as SettingsTone,
    summary: "EcoCash ZiG (ZWG) exchange rate used at checkout",
  },
  {
    href: "/super-admin/settings/integrations",
    label: "Integrations",
    icon: MessageCircle,
    tone: "green" as SettingsTone,
    summary: "WhatsApp numbers allowed into the admin bot panel",
  },
] as const;
