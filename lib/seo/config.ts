// lib/seo/config.ts
import { Metadata, Viewport } from "next";

// Site configuration
export const siteConfig = {
  name: "Pixzel Digital",
  title: "Pixzel Digital - Digital Attendance System with Facial Recognition",
  description:
    "Pixzel Digital is an advanced digital attendance system powered by facial recognition technology. Streamline employee attendance tracking with accuracy and security for modern workplaces.",
  url:
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://pixzel-digital-attendance-2026.vercel.app",
  logo: "/Pixzel-Digital-Logo-Light-Land.png",
  favicon: "/pixzel-no-bg.png",
  twitterHandle: "@pixzeldigital",
  keywords: [
    "facial recognition",
    "digital attendance",
    "employee attendance system",
    "biometric attendance",
    "workforce management",
    "attendance tracking",
    "HR technology",
    "PIXZEL",
    "face recognition attendance",
    "automated attendance system",
  ],
};

// Generate main metadata
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,
  keywords: siteConfig.keywords,

  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,

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

  alternates: {
    canonical: siteConfig.url,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/background.png",
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/background.png"],
  },

  icons: {
    icon: [
      { url: "/pixzel-no-bg.png", sizes: "any" },
      { url: "/pixzel-no-bg.png", type: "image/png", sizes: "32x32" },
      { url: "/pixzel-no-bg.png", type: "image/png", sizes: "192x192" },
      { url: "/pixzel-no-bg.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/pixzel-no-bg.png", sizes: "180x180", type: "image/png" }],
  },

  manifest: "/manifest.json",

  category: "Business Software",
  classification: "HR Technology, Attendance Management System",
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};
