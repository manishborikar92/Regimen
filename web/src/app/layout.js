import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { BRAND } from "@/lib/constants/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

/**
 * Next.js 16 file-based metadata automatically detects and renders non-conflicting tags for:
 * - favicon.ico (32x32 / 16x16 standard favicon)
 * - icon0.svg (vector application icon)
 * - icon1.png (48x48 fallback PNG icon)
 * - apple-icon.png (180x180 PNG touch icon for iOS)
 * - manifest.json (web application manifest)
 */
export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.shortDescription,
  applicationName: BRAND.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND.name,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: BRAND.themeColor,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('vritta-theme');if(s==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased text-main bg-canvas`}>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <SoundProvider>
                <TimerProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </TimerProvider>
              </SoundProvider>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

