"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Authenticating with Google...");

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      fetch(`/api/auth/google-callback?code=${encodeURIComponent(code)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus("Success! Redirecting to your dashboard...");
            router.push("/dashboard");
          } else {
            setStatus(data.error || "Authentication failed.");
          }
        })
        .catch(() => {
          setStatus("Redirecting to dashboard...");
          router.push("/dashboard");
        });
    } else {
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }, [searchParams, router]);

  return (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-brand-aloe/20 text-brand-aloe flex items-center justify-center mx-auto animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-semibold text-white">{status}</h2>
      <p className="text-xs text-neutral-500">Please wait while we secure your session</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <Suspense
        fallback={
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-brand-aloe/20 text-brand-aloe flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-white">Connecting...</h2>
          </div>
        }
      >
        <GoogleCallbackContent />
      </Suspense>
    </div>
  );
}
