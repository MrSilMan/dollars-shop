import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { getAppSettings, buildCssBlock } from "@/lib/app-settings";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  const name = settings.appName;
  return {
    title: { default: `${name} — Shop More. Save More.`, template: `%s | ${name}` },
    description: "Your neighbourhood store for everyday essentials. Quality Everyday. Every Dollar Counts.",
    keywords: ["dollar shop", "zimbabwe", "groceries", "household", "affordable"],
    openGraph: {
      type: "website",
      siteName: name,
      title: `${name} — Softwise Investments`,
      description: "Quality Everyday. Every Dollar Counts.",
    },
    manifest: "/manifest.json",
    ...(settings.faviconUrl && {
      icons: {
        icon: [{ url: `${settings.faviconUrl}?v=${settings.updatedAt.getTime()}`, sizes: "any" }],
        shortcut: `${settings.faviconUrl}?v=${settings.updatedAt.getTime()}`,
      },
    }),
  };
}

export const viewport: Viewport = {
  themeColor: "#FF4400",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getAppSettings();
  const cssBlock = buildCssBlock(settings);

  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssBlock }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: { borderRadius: "12px", fontSize: "13px" },
          }}
        />
      </body>
    </html>
  );
}
