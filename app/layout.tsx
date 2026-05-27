import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
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

export const metadata: Metadata = {
  title: { default: "Dollar Shop — Shop More. Save More.", template: "%s | Dollar Shop" },
  description: "Your neighbourhood store for everyday essentials. Quality Everyday. Every Dollar Counts.",
  keywords: ["dollar shop", "zimbabwe", "groceries", "household", "affordable"],
  openGraph: {
    type: "website",
    siteName: "Dollar Shop",
    title: "Dollar Shop Zimbabwe",
    description: "Quality Everyday. Every Dollar Counts.",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF4400",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}>
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
