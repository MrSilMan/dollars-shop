import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "./prisma";

export type AppSettingsData = {
  id: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  appName: string;
  footerText: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string;
  facebookUrl: string;
  instagramUrl: string;
  fontScale: "SMALL" | "MEDIUM" | "LARGE";
  whatsappAdminNumbers: string[];
  zwgRate: number;
  updatedAt: Date;
};

export const DEFAULT_SETTINGS: AppSettingsData = {
  id: "default",
  primaryColor: "#1A4D3A",
  accentColor: "#F5A623",
  bgColor: "#F8FAF9",
  textColor: "#1A2E25",
  logoUrl: null,
  faviconUrl: null,
  appName: "Dollar Shop",
  footerText: "© 2025 Dollar Shop — Quality Everyday. Every Dollar Counts.",
  contactAddress: "123 Samora Machel Ave, Harare, Zimbabwe",
  contactPhone: "+263 77 256 6468",
  contactEmail: "hello@dollarshop.co.zw",
  contactHours: "Mon–Sat: 8AM–6PM\nSun: 9AM–1PM",
  facebookUrl: "https://facebook.com/dollarshopzw",
  instagramUrl: "https://instagram.com/dollarshopzw",
  fontScale: "MEDIUM",
  whatsappAdminNumbers: [],
  zwgRate: 39,
  updatedAt: new Date(0),
};

export async function getAppSettings(): Promise<AppSettingsData> {
  noStore();
  try {
    const s = await prisma.appSettings.findFirst();
    if (!s) return DEFAULT_SETTINGS;
    return {
      ...s,
      fontScale: s.fontScale as AppSettingsData["fontScale"],
      zwgRate: Number(s.zwgRate),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

const FONT_SIZE_MAP: Record<AppSettingsData["fontScale"], string> = {
  SMALL: "14px",
  MEDIUM: "16px",
  LARGE: "18px",
};

export function buildCssBlock(s: AppSettingsData): string {
  const vars = [
    `--color-primary: ${s.primaryColor}`,
    `--color-primary-dark: color-mix(in srgb, ${s.primaryColor} 85%, black)`,
    `--color-footer-bg: ${s.primaryColor}`,
    `--color-accent: ${s.accentColor}`,
    `--color-accent-light: color-mix(in srgb, ${s.accentColor} 15%, white)`,
    `--color-bg: ${s.bgColor}`,
    `--color-text-primary: ${s.textColor}`,
  ].join("; ");

  const htmlFontSize = FONT_SIZE_MAP[s.fontScale];

  return `:root { ${vars} } html { font-size: ${htmlFontSize}; }`;
}
