import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  getSiteUrl,
  META_DESCRIPTION,
  META_KEYWORDS,
} from "@/lib/copy";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: META_DESCRIPTION,
  keywords: META_KEYWORDS,
  authors: [{ name: BRAND_NAME, url: siteUrl }],
  creator: BRAND_NAME,
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: siteUrl,
    siteName: BRAND_NAME,
    title: BRAND_NAME,
    description: META_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
