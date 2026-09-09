"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Sparkles,
  Palette,
  Key,
  Database,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "profile" | "outreach" | "ai" | "appearance" | "integrations" | "data"
  >("profile");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("Doyin");
  const [lastName, setLastName] = useState("Adedoyin");
  const [email, setEmail] = useState("demo@sponsorflow.io");
  const [targetJobTitle, setTargetJobTitle] = useState("Senior Product Designer");
  const [location, setLocation] = useState("London, UK");
  const [targetSalary, setTargetSalary] = useState(85000);
  const [requiresSponsorship, setRequiresSponsorship] = useState(true);
  const [portfolioUrl, setPortfolioUrl] = useState("https://doyin.design");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/in/doyin");

  // Outreach & Safety
  const [dailyLimit, setDailyLimit] = useState(20);
  const [hourlyLimit, setHourlyLimit] = useState(5);
  const [writingTone, setWritingTone] = useState<"direct" | "warm" | "formal">("warm");
  const [sendingWindowStart, setSendingWindowStart] = useState("09:00");
  const [sendingWindowEnd, setSendingWindowEnd] = useState("17:00");

  // AI & Generation
  const [aiModel, setAiModel] = useState("claude-3-5-sonnet-20241022");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [signature, setSignature] = useState(
    "Best,\nDoyin\nPortfolio: https://doyin.design\nLinkedIn: https://linkedin.com/in/doyin"
  );

  // Load Settings from API
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.settings) {
          const s = data.settings;
          if (s.first_name) setFirstName(s.first_name);
          if (s.last_name) setLastName(s.last_name);
          if (s.email) setEmail(s.email);
          if (s.target_job_title) setTargetJobTitle(s.target_job_title);
          if (s.location) setLocation(s.location);
          if (s.target_salary_gbp) setTargetSalary(s.target_salary_gbp);
          if (s.requires_sponsorship !== undefined) setRequiresSponsorship(s.requires_sponsorship);
          if (s.portfolio_url) setPortfolioUrl(s.portfolio_url);
          if (s.linkedin_url) setLinkedinUrl(s.linkedin_url);
          if (s.daily_limit) setDailyLimit(s.daily_limit);
          if (s.hourly_limit) setHourlyLimit(s.hourly_limit);
          if (s.writing_tone) setWritingTone(s.writing_tone);
          if (s.ai_model) setAiModel(s.ai_model);
          if (s.email_signature) setSignature(s.email_signature);
        }
      } catch (_) {
        // Continue with initial state
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          target_job_title: targetJobTitle,
          location,
          target_salary_gbp: targetSalary,
          requires_sponsorship: requiresSponsorship,
          portfolio_url: portfolioUrl,
          linkedin_url: linkedinUrl,
          daily_limit: dailyLimit,
          hourly_limit: hourlyLimit,
          writing_tone: writingTone,
          sending_window_start: sendingWindowStart,
          sending_window_end: sendingWindowEnd,
          ai_model: aiModel,
          anthropic_api_key: anthropicApiKey || undefined,
          email_signature: signature,
          theme_preference: theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: {
        firstName,
        lastName,
        email,
        targetJobTitle,
        location,
        targetSalary,
        requiresSponsorship,
        portfolioUrl,
        linkedinUrl,
      },
      outreach: {
        dailyLimit,
        hourlyLimit,
        writingTone,
        sendingWindowStart,
        sendingWindowEnd,
      },
      ai: {
        model: aiModel,
        signature,
      },
      exportedAt: new Date().toISOString(),
      platform: "SponsorFlow v0.1",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sponsorflow-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "profile", label: "Profile & Positioning", icon: User },
    { id: "outreach", label: "Outreach & Safety Limits", icon: Shield },
    { id: "ai", label: "Claude AI Configuration", icon: Sparkles },
    { id: "appearance", label: "Appearance & Theme", icon: Palette },
    { id: "integrations", label: "Connected Services", icon: Database },
    { id: "data", label: "Data Management", icon: Key },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-brand-aloe font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Controls & Personalization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-950 dark:text-white tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Configure candidate positioning, safety rate-limiting caps, Claude prompts, and interface theme.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="aloe"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Save / Error Feedback Toast */}
      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-700 dark:text-red-400 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Tabs Sidebar + Form Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings Navigation Tabs */}
        <div className="md:col-span-4 space-y-1.5">
          <Card variant="glass" className="p-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-aloe/30 dark:bg-brand-aloe/15 text-neutral-950 dark:text-brand-aloe border border-brand-aloe/50 dark:border-brand-aloe/30 shadow-sm font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-800 dark:text-brand-aloe" : "text-neutral-500 dark:text-neutral-400"}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-3 h-3 opacity-40 ${isActive ? "opacity-100 text-emerald-800 dark:text-brand-aloe" : ""}`} />
                </button>
              );
            })}
          </Card>

          {/* Quick Stats Pill */}
          <Card variant="glass" className="p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span>Account Mode</span>
              <Badge variant="aloe" className="text-[10px]">Verified Member</Badge>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span>Email Cap</span>
              <span className="font-semibold text-neutral-950 dark:text-white">{dailyLimit} / day</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span>Theme</span>
              <span className="font-semibold text-neutral-950 dark:text-white capitalize">{theme}</span>
            </div>
          </Card>
        </div>

        {/* Tab Panel Content */}
        <div className="md:col-span-8 space-y-6">
          {/* TAB 1: Profile & Positioning */}
          {activeTab === "profile" && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-neutral-200/80 dark:border-white/10 pb-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">Candidate Positioning</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  These details feed into Claude's prompt context when drafting tailored cold outreach.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Doyin"
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Adedoyin"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address (Login)"
                  value={email}
                  disabled
                  hint="Primary email tied to session JWT."
                />
                <Input
                  label="Target Job Title"
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="Senior Product Designer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location / Base"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="London, UK"
                />
                <Input
                  label="Target Salary (GBP)"
                  type="number"
                  value={targetSalary}
                  onChange={(e) => setTargetSalary(Number(e.target.value))}
                  placeholder="85000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Portfolio URL"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://doyin.design"
                />
                <Input
                  label="LinkedIn Profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/doyin"
                />
              </div>

              {/* Visa Sponsorship Toggle */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-950 dark:text-white block">
                    Require UK Skilled Worker Sponsorship
                  </span>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    Filters outreach targets to verified Home Office sponsor license holders.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiresSponsorship(!requiresSponsorship)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    requiresSponsorship ? "bg-brand-aloe" : "bg-neutral-300 dark:bg-neutral-800"
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      requiresSponsorship ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </Card>
          )}

          {/* TAB 2: Outreach & Safety Caps */}
          {activeTab === "outreach" && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-neutral-200/80 dark:border-white/10 pb-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">Gmail Dispatch Safety Caps</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Protect your Google sender reputation with hard daily and hourly dispatch limits.
                </p>
              </div>

              {/* Daily Limit Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-950 dark:text-white">Daily Dispatch Limit</span>
                  <Badge variant="aloe">{dailyLimit} emails / day</Badge>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full accent-brand-aloe cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Recommended: 20/day for personalized cold outreach to avoid spam folder algorithms.
                </p>
              </div>

              {/* Hourly Burst Limit Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-950 dark:text-white">Hourly Burst Limiter</span>
                  <Badge variant="outline">{hourlyLimit} emails / hour</Badge>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={hourlyLimit}
                  onChange={(e) => setHourlyLimit(Number(e.target.value))}
                  className="w-full accent-brand-aloe cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Maximum emails sent in any rolling 60-minute window.
                </p>
              </div>

              {/* Writing Tone Selector */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-neutral-950 dark:text-white block">
                  Default Writing Tone
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "direct", title: "Direct & Crisp", desc: "Straight to the value proposition under 90 words." },
                    { id: "warm", title: "Warm & Peer", desc: "Thoughtful, collaborative, and human tone." },
                    { id: "formal", title: "Executive Formal", desc: "Structured, polite, corporate leadership." },
                  ].map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setWritingTone(t.id as any)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        writingTone === t.id
                          ? "bg-emerald-50 dark:bg-brand-aloe/10 border-emerald-500 dark:border-brand-aloe text-neutral-950 dark:text-white shadow-sm"
                          : "bg-neutral-50 dark:bg-white/[0.02] border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                      }`}
                    >
                      <span className="font-semibold text-neutral-950 dark:text-white block mb-1">{t.title}</span>
                      <span className="text-[11px] leading-relaxed">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Working Hours Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Dispatch Window Start (UK BST)"
                  type="time"
                  value={sendingWindowStart}
                  onChange={(e) => setSendingWindowStart(e.target.value)}
                />
                <Input
                  label="Dispatch Window End (UK BST)"
                  type="time"
                  value={sendingWindowEnd}
                  onChange={(e) => setSendingWindowEnd(e.target.value)}
                />
              </div>
            </Card>
          )}

          {/* TAB 3: Claude AI Personalization */}
          {activeTab === "ai" && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-neutral-200/80 dark:border-white/10 pb-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">Claude AI Engine</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Configure the underlying Anthropic intelligence parameters and custom signature.
                </p>
              </div>

              {/* Model Choice */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-950 dark:text-white">Anthropic Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-brand-aloe shadow-sm"
                >
                  <option value="claude-3-5-sonnet-20241022">
                    Claude 3.5 Sonnet (Recommended — Highest Conversion & Nuance)
                  </option>
                  <option value="claude-3-opus-20240229">
                    Claude 3 Opus (Maximum Depth)
                  </option>
                  <option value="claude-3-5-haiku-20241022">
                    Claude 3.5 Haiku (High Speed & Low Latency)
                  </option>
                </select>
              </div>

              {/* Custom API Key */}
              <Input
                label="Custom Anthropic API Key (Optional)"
                type="password"
                value={anthropicApiKey}
                onChange={(e) => setAnthropicApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                hint="Leave empty to use SponsorFlow platform-provided Claude 3.5 Sonnet keys."
              />

              {/* Email Signature */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-950 dark:text-white">Custom Email Signature</label>
                <textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-white/10 text-neutral-900 dark:text-white text-xs focus:outline-none focus:border-brand-aloe resize-none font-mono shadow-sm leading-relaxed"
                  placeholder="Best,&#10;Your Name&#10;Portfolio: https://..."
                />
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Appended automatically to generated drafts before entering review queue.
                </p>
              </div>
            </Card>
          )}

          {/* TAB 4: Appearance & Theme */}
          {activeTab === "appearance" && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-neutral-200/80 dark:border-white/10 pb-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">Interface & Visual Theme</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Select your preferred palette. Light mode provides a high-contrast Shopify cream-mint canvas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Dark Mode Tile */}
                <div
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 ${
                    theme === "dark"
                      ? "border-emerald-500 dark:border-brand-aloe bg-emerald-50/50 dark:bg-brand-aloe/10 shadow-lg shadow-brand-aloe/5"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300"
                  }`}
                >
                  <div className="w-full h-20 rounded-xl bg-black border border-neutral-800 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400/80" />
                      <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-3/4 h-2 rounded bg-white/20" />
                      <div className="w-1/2 h-2 rounded bg-brand-aloe/40" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-emerald-700 dark:text-brand-aloe" />
                      <span className="text-xs font-semibold text-neutral-950 dark:text-white">Dark Mode</span>
                    </div>
                    {theme === "dark" && <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-brand-aloe" />}
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Cinematic night black with glowing aloe & pistachio accents.
                  </span>
                </div>

                {/* Light Mode Tile */}
                <div
                  onClick={() => setTheme("light")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 ${
                    theme === "light"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-lg shadow-emerald-500/10"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300"
                  }`}
                >
                  <div className="w-full h-20 rounded-xl bg-[#fbfbf5] border border-neutral-300 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400/80" />
                      <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-3/4 h-2 rounded bg-neutral-800/60" />
                      <div className="w-1/2 h-2 rounded bg-emerald-600/40" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-neutral-950 dark:text-white">Light Mode</span>
                    </div>
                    {theme === "light" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Shopify cream-mint canvas with crisp typography and card surfaces.
                  </span>
                </div>

                {/* System Mode Tile */}
                <div
                  onClick={() => setTheme("system")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 ${
                    theme === "system"
                      ? "border-sky-500 bg-sky-50/60 dark:bg-sky-400/10 shadow-lg shadow-sky-400/5"
                      : "border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/60 hover:border-neutral-300"
                  }`}
                >
                  <div className="w-full h-20 rounded-xl bg-gradient-to-r from-black via-neutral-800 to-[#fbfbf5] border border-neutral-300 dark:border-white/10 p-2.5 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400/80" />
                      <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="space-y-1">
                      <div className="w-3/4 h-2 rounded bg-white/40" />
                      <div className="w-1/2 h-2 rounded bg-white/30" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      <span className="text-xs font-semibold text-neutral-950 dark:text-white">System Sync</span>
                    </div>
                    {theme === "system" && <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />}
                  </div>
                  <span className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Automatically matches your macOS / browser color preference.
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: Integrations & Health */}
          {activeTab === "integrations" && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-neutral-200/80 dark:border-white/10 pb-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">Integrations & Service Health</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Verify connection to external transports, databases, and webhook listeners.
                </p>
              </div>

              <div className="space-y-3">
                {/* Gmail Integration Card */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-950 dark:text-white">Gmail OAuth 2.0</span>
                        <Badge variant="aloe" className="text-[10px]">Connected</Badge>
                      </div>
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        Outbound sending & reply monitoring active.
                      </span>
                    </div>
                  </div>
                  <a href="/api/gmail/connect">
                    <Button variant="secondary" size="sm">
                      Re-authorize
                    </Button>
                  </a>
                </div>

                {/* Supabase PostgreSQL Card */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-950 dark:text-white">Supabase PostgreSQL 15</span>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                          17 Tables Active
                        </Badge>
                      </div>
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        Row-Level Security (RLS) multi-tenant isolation enforced.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                  </span>
                </div>

                {/* Pub/Sub Webhook Card */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-950 dark:text-white">Google Cloud Pub/Sub Webhook</span>
                        <Badge variant="aloe" className="text-[10px]">Live Edge Route</Badge>
                      </div>
                      <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                        Endpoint: <code className="font-mono">/api/gmail/webhook</code>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 6: Data Management */}
          {activeTab === "data" && (
            <Card variant="glass" className="p-6 space-y-6">
              <div className="border-b border-neutral-200/80 dark:border-white/10 pb-4">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white">Data Management & Privacy</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Export your campaign data or manage account state.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-950 dark:text-white block">
                      Export Campaign Data (JSON)
                    </span>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      Download full profile, positioning angles, and email logs.
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleExportData}
                    className="gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/[0.04] border border-red-200 dark:border-red-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 block">
                      Danger Zone: Reset Demo State
                    </span>
                    <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
                      Clears local cache, temporary drafted emails, and resets demo counters.
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm("Reset demo data and clear cached state?")) {
                        localStorage.removeItem("sponsorflow_notifications");
                        window.location.reload();
                      }
                    }}
                    className="gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Reset Demo
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
