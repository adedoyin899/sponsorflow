"use client";

import React from "react";
import { Sparkles, CheckCircle2, Clock, Shield, Zap } from "lucide-react";
import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

const steps = [
  { icon: CheckCircle2, label: "Basic profile (2 min)" },
  { icon: Zap, label: "Skills & projects (5 min)" },
  { icon: Shield, label: "Sponsorship requirements (1 min)" },
  { icon: Sparkles, label: "Industry positioning (5 min)" },
  { icon: Clock, label: "Your story & tone (3 min)" },
];

function Step1Content() {
  return (
    <OnboardingLayout step={1} nextLabel="Let's get started" hideBack>
      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 pt-4">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-brand-aloe" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-light text-neutral-900 tracking-tight">
              Welcome to SponsorFlow
            </h1>
            <p className="text-neutral-500 text-base leading-relaxed max-w-sm mx-auto">
              Let&apos;s set up your profile so our AI can write highly personalized
              cold emails that actually get responses.
            </p>
          </div>
        </div>

        {/* What we'll do */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-neutral-900">
            Here&apos;s what we&apos;ll set up (~15 minutes total):
          </p>
          <ul className="space-y-3">
            {steps.map(({ icon: Icon, label }, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-neutral-700">
                <div className="w-7 h-7 rounded-lg bg-brand-aloe/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-black" />
                </div>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Promise */}
        <div className="bg-neutral-900 rounded-2xl p-5 text-center space-y-1">
          <p className="text-white font-medium text-sm">
            Your data powers your emails — no one else&apos;s.
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Every email is reviewed and approved by you before it&apos;s sent.
            Full control, always.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default function OnboardingStep1() {
  return (
    <OnboardingProvider>
      <Step1Content />
    </OnboardingProvider>
  );
}
