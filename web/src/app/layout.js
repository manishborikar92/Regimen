import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { BRAND } from "@/lib/constants/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.shortDescription,
  applicationName: BRAND.name,
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND.name,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: BRAND.themeColor,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-gray-900 bg-slate-50`}>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
