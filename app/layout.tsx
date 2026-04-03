import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip"
import Script from "next/script";
import { Plus_Jakarta_Sans, DM_Serif_Display, Fira_Code, Outfit } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  title: "PIXZEL - Digital Attendance",
  description: "Facial recognition digital attendance system for employers",
  icons: {
    icon: [{ url: "/pixzel-no-bg.png", type: "image/png" }],
    apple: [{ url: "/pixzel-no-bg.png", type: "image/png" }],
  },
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
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Script id="theme-script" strategy="afterInteractive">{`
          (function() {
            const theme = localStorage.getItem('theme');
            if (theme === 'light') {
              document.documentElement.classList.remove('dark');
            } else {
              document.documentElement.classList.add('dark');
            }
          })();
        `}</Script>
      </body>
    </html>
  );
}
