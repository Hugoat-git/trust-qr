import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://qr-fidelite.com'),
  title: {
    default: "QR Fidélité - Fidélisez vos clients et boostez vos avis Google",
    template: "%s | QR Fidélité",
  },
  description: "Collectez des avis Google, fidélisez vos clients avec des réductions gamifiées et construisez votre base CRM. Le tout via un simple QR code.",
  keywords: ["fidélité", "restaurant", "QR code", "avis Google", "CRM", "réductions", "gamification"],
  authors: [{ name: "QR Fidélité" }],
  creator: "QR Fidélité",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "QR Fidélité",
    title: "QR Fidélité - Fidélisez vos clients et boostez vos avis Google",
    description: "Collectez des avis Google, fidélisez vos clients avec des réductions gamifiées et construisez votre base CRM.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QR Fidélité",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Fidélité - Fidélisez vos clients",
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
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
