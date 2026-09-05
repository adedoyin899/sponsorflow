"use client";

/**
 * OnboardingLayout — shared shell for all 10 onboarding steps.
 *
 * Shows:
 *  - SponsorFlow logo
 *  - Step progress bar + numbered indicator
 *  - Save status badge (Saving… / ✓ Saved)
 *  - Card content area (children)
 *  - Back / Next navigation buttons
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useOnboarding, SaveStatus } from "./OnboardingContext";
import { Button } from "@/components/ui/button";

const STEP_LABELS = [
  "Welcome",
  "Basic Info",
  "Background",
  "Skills",
  "Projects",
  "Sponsorship",
  "Fintech",
  "Healthcare",
  "Your Story",
  "Review",
];

interface OnboardingLayoutProps {
  step: number; // 1-10
  children: React.ReactNode;
  onNext?: () => Promise<boolean> | boolean; // return false to block navigation
  onBack?: () => void;
  nextLabel?: string;
  isNextLoading?: boolean;
  hideBack?: boolean;
  hideNext?: boolean;
}

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <div className={`
      inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all duration-300
      ${status === "saving" ? "bg-neutral-800 text-neutral-400" : ""}
      ${status === "saved" ? "bg-brand-aloe/15 text-brand-aloe" : ""}
      ${status === "error" ? "bg-red-500/15 text-red-400" : ""}
    `}>
      {status === "saving" && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === "saved" && <CheckCircle2 className="w-3 h-3" />}
      {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save failed"}
    </div>
  );
}

export function OnboardingLayout({
  step,
  children,
  onNext,
  onBack,
  nextLabel = "Continue",
  isNextLoading = false,
  hideBack = false,
  hideNext = false,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const { saveStatus } = useOnboarding();
  const progressPct = ((step - 1) / (STEP_LABELS.length - 1)) * 100;

  const handleNext = async () => {
    if (onNext) {
      const ok = await onNext();
      if (!ok) return;
    }
    if (step < 10) {
      router.push(`/onboarding/step-${step + 1}`);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    if (step > 1) {
      router.push(`/onboarding/step-${step - 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-canvas-cream/90 backdrop-blur border-b border-neutral-200 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="text-sm font-semibold text-neutral-900 tracking-tight">SponsorFlow</span>
          </Link>
          <SaveBadge status={saveStatus} />
          <div className="text-xs text-neutral-500 font-medium">
            Step {step} of {STEP_LABELS.length}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full h-1 bg-neutral-200">
        <div
          className="h-full bg-brand-aloe transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step indicator pills */}
      <div className="max-w-2xl mx-auto w-full px-6 pt-6 pb-2">
        <div className="flex gap-1.5 flex-wrap">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            const isDone = s < step;
            const isCurrent = s === step;
            return (
              <div
                key={s}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  isCurrent
                    ? "bg-black text-white"
                    : isDone
                    ? "bg-brand-aloe/30 text-black"
                    : "bg-neutral-200 text-neutral-500"
                }`}
              >
                {s}. {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 pb-12 pt-4">
        {children}
      </main>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-canvas-cream/95 backdrop-blur border-t border-neutral-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
          {!hideBack && step > 1 ? (
            <Button
              id={`onboarding-back-step-${step}`}
              variant="secondary"
              size="md"
              onClick={handleBack}
              className="gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          ) : (
            <div />
          )}
          {!hideNext && (
            <Button
              id={`onboarding-next-step-${step}`}
              variant="aloe"
              size="md"
              onClick={handleNext}
              isLoading={isNextLoading}
              className="gap-1.5 min-w-[140px]"
            >
              {nextLabel} <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
