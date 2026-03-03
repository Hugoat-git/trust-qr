import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://trustqr.dev'),
  title: {
    default: "TrustQR - Fidélisez vos clients et boostez vos avis Google",
    template: "%s | TrustQR",
  },
  description: "Collectez des avis Google, fidélisez vos clients avec des réductions gamifiées et construisez votre base CRM. Le tout via un simple QR code.",
  keywords: ["fidélité", "restaurant", "QR code", "avis Google", "CRM", "réductions", "gamification"],
  authors: [{ name: "TrustQR" }],
  creator: "TrustQR",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "TrustQR",
    title: "TrustQR - Fidélisez vos clients et boostez vos avis Google",
    description: "Collectez des avis Google, fidélisez vos clients avec des réductions gamifiées et construisez votre base CRM.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TrustQR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustQR - Fidélisez vos clients",
    description: "Collectez des avis Google et fidélisez vos clients avec des réductions gamifiées.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
