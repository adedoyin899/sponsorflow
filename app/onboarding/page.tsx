"use client";

/**
 * /onboarding — Root layout wrapper for all onboarding step pages.
 * Wraps children with OnboardingProvider so all steps share context.
 */

import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";

export default function OnboardingRootPage() {
  return (
    <OnboardingProvider>
      {/* Redirect to step 1 on root /onboarding */}
      <StepRedirect />
    </OnboardingProvider>
  );
}

function StepRedirect() {
  // Client-side redirect
  if (typeof window !== "undefined") {
    window.location.replace("/onboarding/step-1");
  }
  return (
    <div className="min-h-screen bg-canvas-cream flex items-center justify-center">
      <div className="text-neutral-500 text-sm animate-pulse">Loading onboarding…</div>
    </div>
  );
}
