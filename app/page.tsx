import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  MailCheck,
  BarChart3,
  CheckCircle2,
  Send,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-aloe selection:text-black">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-aloe flex items-center justify-center text-black font-bold text-sm">
              S
            </div>
            <span className="font-semibold text-white tracking-tight text-lg">SponsorFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors">
              Curated Sponsors
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-300">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm" className="bg-white text-black font-medium">
                Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-32 px-6 overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-aloe/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-brand-aloe font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-User UK Job Acquisition Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white leading-[1.08]">
            Land interviews with <br className="hidden sm:inline" />
            <span className="gradient-mint-text font-normal">vetted UK tech sponsors</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Turn your background, skills, and industry positioning into high-converting, personalized cold outreach. 100% human-approved before sending.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="aloe" size="lg" className="shadow-lg shadow-brand-aloe/10">
                Start Job Acquisition <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg">
                View Live Demo Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-10 flex items-center justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Data Isolation & RLS</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Claude 3.5 Personalization</span>
            </div>
            <div className="flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-sky-400" />
              <span>Gmail Safety Caps (20/day)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Preview */}
      <section id="how-it-works" className="py-20 px-6 border-t border-white/5 bg-neutral-950/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-brand-aloe border-brand-aloe/30">
              The 6-Step Engine
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
              Personalized Outreach at Systematic Scale
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              From profile onboarding to AI drafting and webhook reply detection, every stage is built for conversion and human control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="glass" className="p-6 space-y-4 hover:border-white/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-brand-aloe/10 text-brand-aloe flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white">10-Step Profile & Positioning</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Capture your experience, target salary, visa sponsorship needs, and tailored pitch angles for Fintech, Healthcare, and SaaS.
              </p>
            </Card>

            <Card variant="glass" className="p-6 space-y-4 hover:border-white/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white">Curated Sponsor CSV Import</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Upload company lists with smart deduplication. Preloaded with 54 verified London tech sponsors with active worker licenses.
              </p>
            </Card>

            <Card variant="glass" className="p-6 space-y-4 hover:border-white/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white">Human-in-the-Loop Approval</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Claude generates ultra-concise (70–150 words) cold emails. You review, refine, or regenerate before anything gets dispatched.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Curated Sponsors Grid */}
      <section id="pipeline" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="aloe">Target Pipeline</Badge>
              <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-2">
                Top UK Licensed Tech Sponsors
              </h2>
            </div>
            <Link href="/dashboard/companies">
              <Button variant="secondary" size="sm">
                View All 54 Sponsors <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {["ClearBank", "Canva", "Cloudflare", "Atlassian", "Monzo", "Wise"].map((company) => (
              <div
                key={company}
                className="p-4 rounded-xl glass-card border border-white/5 text-center flex flex-col items-center justify-center gap-1.5"
              >
                <span className="font-semibold text-sm text-white">{company}</span>
                <span className="text-[10px] text-emerald-400 font-medium">Worker (A-Rating)</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-brand-aloe flex items-center justify-center text-black font-bold text-[10px]">
              S
            </div>
            <span className="text-white font-medium">SponsorFlow</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white transition-colors">
              Sign Up
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
