import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SponsorFlow | AI-Powered UK Tech Job Acquisition Engine",
  description:
    "Systematic, personalized cold outreach engine for high-tier UK visa sponsors. Connect with verified hiring teams in fintech, healthcare, and SaaS with human-in-the-loop review.",
  keywords: [
    "UK Visa Sponsorship",
    "Tech Jobs UK",
    "Skilled Worker Visa",
    "Cold Outreach Engine",
    "AI Job Acquisition",
    "Product Design Jobs",
  ],
  authors: [{ name: "SponsorFlow" }],
  openGraph: {
    title: "SponsorFlow | AI-Powered UK Tech Job Acquisition Engine",
    description:
      "Get interviews from 100+ vetted UK tech sponsors with personalized AI outreach and human-in-the-loop safety.",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('sponsorflow_theme');
                const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-brand-aloe selection:text-black">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
