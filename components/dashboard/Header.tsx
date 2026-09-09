"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User, Bell } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-aloe flex items-center justify-center text-black font-bold text-sm">
              S
            </div>
            <span className="font-semibold text-white tracking-tight">SponsorFlow</span>
          </Link>
          <span className="hidden md:inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
            Phase 1 Engine
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <Bell className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-white">{email || userEmail || "Member"}</span>
              <span className="text-[10px] text-neutral-500">Free Tier</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-400 hover:text-red-400"
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
