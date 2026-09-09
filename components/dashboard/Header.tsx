"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User } from "lucide-react";
import { NotificationPopover } from "./NotificationPopover";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header({ userEmail }: { userEmail?: string }) {
  const [email, setEmail] = useState(userEmail || "");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.email) {
          setEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-white/5 dashboard-header bg-white/85 dark:bg-black/70 backdrop-blur-xl transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-aloe flex items-center justify-center text-black font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-semibold text-neutral-950 dark:text-white tracking-tight">SponsorFlow</span>
          </Link>
          <span className="hidden md:inline-flex items-center text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-white/5 font-medium">
            UK Sponsor Engine
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          {/* Interactive Notifications */}
          <NotificationPopover />
          
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-white/10">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">{email || userEmail || "Member"}</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">Free Tier</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 h-8 w-8 p-0"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
