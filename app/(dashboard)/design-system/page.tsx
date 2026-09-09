"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/ThemeProvider";
import {
  Palette,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Send,
  UploadCloud,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function DesignSystemPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [testInputVal, setTestInputVal] = useState("john.doe@company.com");
  const [isTestLoading, setIsTestLoading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorTokens = [
    { name: "Canvas Night", hex: "#000000", class: "bg-black text-white", role: "Cinematic marketing canvas, dark hero pages, and dark cards" },
    { name: "Canvas Night Elevated", hex: "#0a0a0a", class: "bg-neutral-950 text-white", role: "Dark elevated cards and video frames" },
    { name: "Surface Elevated Dark", hex: "#1e2c31", class: "bg-[#1e2c31] text-white", role: "Teal-shifted dark surface for chrome & subtle depth" },
    { name: "Canvas Cream", hex: "#fbfbf5", class: "bg-[#fbfbf5] text-black border border-neutral-300", role: "Transactional and dashboard background canvas" },
    { name: "Canvas Light", hex: "#ffffff", class: "bg-white text-black border border-neutral-300", role: "Light card surfaces and table containers" },
    { name: "Aloe Accent", hex: "#c1fbd4", class: "bg-[#c1fbd4] text-black", role: "Featured CTA buttons, primary growth badges & active tabs" },
    { name: "Pistachio Accent", hex: "#d4f9e0", class: "bg-[#d4f9e0] text-black", role: "Feature category section bands and soft green fills" },
    { name: "Mint Link", hex: "#99b3ad", class: "bg-[#99b3ad] text-black", role: "Cool accent link color and secondary charts" },
    { name: "Ink", hex: "#000000", class: "bg-black text-white", role: "All primary typography on light canvas" },
    { name: "Hairline Light", hex: "#e4e4e7", class: "bg-[#e4e4e7] text-black", role: "1px hairline borders for light cards & table dividers" },
  ];

  return (
    <div className="space-y-12 max-w-6xl pb-16">
      {/* Header & Polarity Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-brand-aloe font-semibold mb-1">
            <Palette className="w-3.5 h-3.5" />
            <span>Shopify-Inspired Design System Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-neutral-950 dark:text-white tracking-tight">
            Design Tokens & UI Primitives
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            Directly connected to <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-emerald-800 dark:text-brand-aloe">@/components/ui/</code>.
            Tweaking primitives propagates automatically across the entire SponsorFlow application.
          </p>
        </div>

        {/* Theme Quick Switcher */}
        <div className="flex items-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              theme === "light"
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              theme === "dark"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-emerald-400" /> Dark
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              theme === "system"
                ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-sky-500" /> System
          </button>
        </div>
      </div>

      {/* SECTION 1: Color Tokens Palette */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">1. Dual-Track Color Tokens</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Click any swatch to copy its HEX token. Based on the Shopify commerce specification in <code className="font-mono">shopifydesignskills.md</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {colorTokens.map((token) => (
            <div
              key={token.name}
              onClick={() => copyToClipboard(token.hex)}
              className="group cursor-pointer rounded-2xl p-3 bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-white/5 shadow-paper dark:shadow-none hover:border-emerald-500/50 transition-all space-y-2.5"
            >
              <div className={`w-full h-16 rounded-xl ${token.class} flex items-end p-2 justify-between`}>
                <span className="font-mono text-[10px] font-bold tracking-wider">{token.hex}</span>
                {copiedToken === token.hex && (
                  <span className="text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">Copied!</span>
                )}
              </div>
              <div>
                <span className="font-semibold text-xs text-neutral-950 dark:text-white block">{token.name}</span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                  {token.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Typography Scale */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">2. Typographic Scale & Hierarchy</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Display cuts render at thin weights (300/330) with positive tracking air. UI body rendered in Inter Variable with <code className="font-mono">font-feature-settings: ss03</code>.
          </p>
        </div>

        <Card variant="glass" className="p-6 space-y-6">
          <div className="space-y-1 pb-4 border-b border-neutral-200/80 dark:border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 dark:text-brand-aloe">Display XXL · 96px / Weight 300 / Tracking +2.4px</span>
            <div className="text-4xl sm:text-6xl font-light text-neutral-950 dark:text-white tracking-tight">
              Cinematic Hero
            </div>
          </div>

          <div className="space-y-1 pb-4 border-b border-neutral-200/80 dark:border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Display LG · 55px / Weight 300</span>
            <div className="text-2xl sm:text-3xl md:text-4xl font-light text-neutral-950 dark:text-white tracking-tight">
              Curated UK Skilled Worker Sponsors
            </div>
          </div>

          <div className="space-y-1 pb-4 border-b border-neutral-200/80 dark:border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Heading XL · 28px / Weight 500</span>
            <div className="text-xl sm:text-2xl font-semibold text-neutral-950 dark:text-white tracking-tight">
              Personalized Cold Outreach Engine
            </div>
          </div>

          <div className="space-y-1 pb-4 border-b border-neutral-200/80 dark:border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Body LG · 18px / Weight 450</span>
            <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-3xl">
              Turn your experience into tailored, high-converting cold emails for verified UK tech sponsors. Every email is verified with Human-In-The-Loop review before dispatch.
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Monospace Code · 13px</span>
            <p className="font-mono text-xs text-emerald-800 dark:text-brand-aloe bg-neutral-100 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
              {`const email = await claude.generate({ candidate_id: "usr_102", sponsor: "ClearBank" });`}
            </p>
          </div>
        </Card>
      </div>

      {/* SECTION 3: Buttons (Pill Geometry) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">3. Pill Buttons (All Variants & States)</h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              The pill shape (<code className="font-mono">rounded-pill</code> / 9999px) is universal. Click buttons below to test loading & state responsiveness.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTestLoading(!isTestLoading)}
            className="text-xs"
          >
            Toggle Loading State ({isTestLoading ? "Active" : "Off"})
          </Button>
        </div>

        <Card variant="glass" className="p-6 space-y-6">
          {/* Button Sizes */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">Sizes</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="aloe" size="sm" isLoading={isTestLoading}>
                Small (sm)
              </Button>
              <Button variant="aloe" size="md" isLoading={isTestLoading}>
                Medium (md) Default
              </Button>
              <Button variant="aloe" size="lg" isLoading={isTestLoading}>
                Large (lg) Hero CTA
              </Button>
            </div>
          </div>

          {/* Button Variants */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">Variants</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-medium text-neutral-500 block">Primary (Black on Light / White on Dark)</span>
                <Button variant="primary" size="md" isLoading={isTestLoading} className="w-full">
                  Primary Pill
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-medium text-neutral-500 block">Aloe Accent (Featured Growth)</span>
                <Button variant="aloe" size="md" isLoading={isTestLoading} className="w-full">
                  <Sparkles className="w-4 h-4 mr-1.5" /> Start Trial (Aloe)
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-medium text-neutral-500 block">Secondary (Card Surface)</span>
                <Button variant="secondary" size="md" isLoading={isTestLoading} className="w-full">
                  Secondary Action
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-medium text-neutral-500 block">Outline (Stroked Pill)</span>
                <Button variant="outline" size="md" isLoading={isTestLoading} className="w-full">
                  Outline Pill
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-medium text-neutral-500 block">Ghost (Minimal Utility)</span>
                <Button variant="ghost" size="md" isLoading={isTestLoading} className="w-full">
                  Ghost Button
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/5 space-y-2">
                <span className="text-xs font-medium text-neutral-500 block">Danger (Destructive State)</span>
                <Button variant="danger" size="md" isLoading={isTestLoading} className="w-full">
                  Delete / Reject
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 4: Badges & Chips */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">4. Badges & Status Chips</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            WCAG AA compliant color pairings. Clear contrast against both light cream and dark night canvases.
          </p>
        </div>

        <Card variant="glass" className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="aloe">Aloe: Approved ✓</Badge>
            <Badge variant="pistachio">Pistachio: Active Band</Badge>
            <Badge variant="success">Success: Sent</Badge>
            <Badge variant="warning">Warning: Review Pending</Badge>
            <Badge variant="danger">Danger: Rejected</Badge>
            <Badge variant="outline">Outline: Skilled Worker (A)</Badge>
            <Badge variant="default">Neutral: Draft</Badge>
          </div>
        </Card>
      </div>

      {/* SECTION 5: Form Inputs & Controls */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">5. Form Controls & Inputs</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Accessible labels, 44px touch targets, clear border indicators, and high contrast text.
          </p>
        </div>

        <Card variant="glass" className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Standard Input"
              placeholder="e.g. Lead Full-Stack Engineer"
              value={testInputVal}
              onChange={(e) => setTestInputVal(e.target.value)}
              hint="Changes here test interactive React re-renders."
            />
            <Input
              label="Error State Input"
              placeholder="e.g. invalid_email"
              defaultValue="invalid@broken"
              error="Please enter a valid company domain or work email."
            />
          </div>
        </Card>
      </div>

      {/* SECTION 6: Cards & Surfaces */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">6. Cards & Elevation Hierarchy</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Level 3 Stacked Paper Halo shadow on light canvas; Level 1 sheen on dark canvas. Featured fills use Aloe and Pistachio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="glass" className="p-6 space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-500">Card: Default Glass</span>
            <h3 className="text-base font-semibold text-neutral-950 dark:text-white">ClearBank Sponsor Profile</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Standard interactive card with 16px corner radius and paper halo shadow.
            </p>
          </Card>

          <Card variant="aloe" className="p-6 space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-700">Card: Featured Aloe Fill</span>
            <h3 className="text-base font-semibold text-black">Campaign Highlight</h3>
            <p className="text-xs text-neutral-800 leading-relaxed">
              Shopify signature featured card fill using <code className="font-mono text-xs">aloe-10</code> (#c1fbd4).
            </p>
          </Card>

          <Card variant="pistachio" className="p-6 space-y-2">
            <span className="text-xs font-mono uppercase text-neutral-700">Card: Pistachio Section Band</span>
            <h3 className="text-base font-semibold text-black">Fintech Category</h3>
            <p className="text-xs text-neutral-800 leading-relaxed">
              Soft green category background band using <code className="font-mono text-xs">pistachio-10</code> (#d4f9e0).
            </p>
          </Card>
        </div>
      </div>

      {/* SECTION 7: Side-by-Side Dual-Theme Live Sandbox */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white tracking-tight">7. Side-by-Side Theme Simulator</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Forced simultaneously in Light and Dark mode side-by-side to visually audit contrast and accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forced Light Sandbox */}
          <div className="light p-6 rounded-3xl bg-[#fbfbf5] border border-neutral-300 shadow-paper space-y-5 text-black">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-black">Forced Light Canvas (#fbfbf5)</span>
              </div>
              <Badge variant="aloe">High Contrast AA</Badge>
            </div>

            <div className="space-y-1">
              <span className="text-2xl font-light text-black tracking-tight block">Outreach Campaign</span>
              <p className="text-xs text-neutral-600">Review drafted emails and verify rate limits.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-paper space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-black">ClearBank (Fintech)</span>
                <Badge variant="aloe">Ready</Badge>
              </div>
              <p className="text-xs text-neutral-700 font-mono bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                Hi Sarah, noticed ClearBank's cloud core rails...
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button variant="primary" size="sm">
                  Approve Draft
                </Button>
                <Button variant="secondary" size="sm">
                  Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Forced Dark Sandbox */}
          <div className="dark p-6 rounded-3xl bg-black border border-white/10 shadow-elevated space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Forced Night Canvas (#000000)</span>
              </div>
              <Badge variant="aloe">High Contrast AA</Badge>
            </div>

            <div className="space-y-1">
              <span className="text-2xl font-light text-white tracking-tight block">Outreach Campaign</span>
              <p className="text-xs text-neutral-400">Review drafted emails and verify rate limits.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-elevated space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">ClearBank (Fintech)</span>
                <Badge variant="aloe">Ready</Badge>
              </div>
              <p className="text-xs text-neutral-300 font-mono bg-black/60 p-2.5 rounded-xl border border-white/10">
                Hi Sarah, noticed ClearBank's cloud core rails...
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button variant="primary" size="sm">
                  Approve Draft
                </Button>
                <Button variant="secondary" size="sm">
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
