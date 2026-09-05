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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-black text-white antialiased selection:bg-brand-aloe selection:text-black">
        {children}
      </body>
    </html>
  );
}
