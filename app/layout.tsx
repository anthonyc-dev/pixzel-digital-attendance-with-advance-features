import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip"
import Script from "next/script";
import { Plus_Jakarta_Sans, DM_Serif_Display, Fira_Code, Outfit } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { metadata as seoMetadata, viewport as seoViewport, siteConfig } from "@/lib/seo/config";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Export metadata from config
export const metadata: Metadata = seoMetadata;
export const viewport: Viewport = seoViewport;

// JSON-LD Structured Data
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": siteConfig.name,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": siteConfig.description,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
  },
  "featureList": [
    "Facial Recognition Technology",
    "Real-time Attendance Tracking",
    "Automated Timesheets",
    "Integration with HR Systems",
    "Mobile App Support",
    "Advanced Analytics Dashboard"
  ],
  "url": siteConfig.url,
  "logo": `${siteConfig.url}${siteConfig.logo}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${plusJakarta.variable} ${outfit.variable} ${dmSerif.variable} ${firaCode.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.pixzel.com" />

        {/* Language alternates */}
        <link rel="alternate" hrefLang="en" href={siteConfig.url} />
        <link rel="alternate" hrefLang="x-default" href={siteConfig.url} />

        {/* Security headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Resource hints */}
        <link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Synchronous Theme Initialization */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
