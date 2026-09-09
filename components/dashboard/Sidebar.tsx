"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  Building2,
  Mail,
  BarChart3,
  Settings,
  Sparkles,
  UploadCloud,
  MessageSquare,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Profile & Positioning", href: "/dashboard/profile", icon: User },
    { name: "Companies", href: "/dashboard/companies", icon: Building2 },
    { name: "Outreach & Drafts", href: "/dashboard/emails", icon: Mail },
    { name: "Inbound Replies", href: "/dashboard/replies", icon: MessageSquare },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 dashboard-sidebar bg-black/40 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors duration-200">
      <div className="space-y-6">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const normalizedPath = pathname.replace(/^\/dashboard/, "") || "/dashboard";
            const normalizedHref = item.href.replace(/^\/dashboard/, "") || "/dashboard";
            const isActive =
              pathname === item.href ||
              normalizedPath === normalizedHref ||
              (normalizedHref !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-brand-aloe/10 text-brand-aloe border border-brand-aloe/20"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-brand-aloe" : "text-neutral-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 rounded-2xl glass-card border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-brand-aloe text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Outbound Cap</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-400">Used today</span>
              <span className="text-white font-medium">0 / 20</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-aloe h-full rounded-full" style={{ width: "0%" }}></div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            Safety rate-limiting keeps your sender domain healthy.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 text-xs text-neutral-500 flex items-center justify-between">
        <span>SponsorFlow v0.1</span>
        <span className="text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Ready
        </span>
      </div>
    </aside>
  );
}
