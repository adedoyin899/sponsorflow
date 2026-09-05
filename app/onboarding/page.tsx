"use client";

/**
 * /onboarding — Placeholder for Prompt 5 (10-Step User Profile Onboarding)
 *
 * New users arriving from Google OAuth are redirected here.
 * The full onboarding wizard will be built in Prompt 5.
 * For now, we redirect to /dashboard after a brief welcome.
 */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    // Temporary: redirect to dashboard after 2s until Prompt 5 implements the wizard
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-6 max-w-sm mx-auto px-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-aloe/20 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-brand-aloe" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-light text-white tracking-tight">
            Welcome to SponsorFlow!
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Your account is ready. Taking you to your dashboard…
          </p>
        </div>
        <div className="flex justify-center">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand-aloe animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-neutral-600">
          Full onboarding wizard coming in Phase 1 — Prompt 5
        </p>
      </div>
    </div>
  );
}
