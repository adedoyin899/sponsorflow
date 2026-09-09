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
  MessageSquare,
  Palette,
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
    { name: "Design System", href: "/dashboard/design-system", icon: Palette },
  ];

  return (
    <aside className="w-64 border-r border-neutral-200/80 dark:border-white/5 dashboard-sidebar bg-white dark:bg-black/40 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors duration-200">
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
                    ? "bg-brand-aloe/25 text-neutral-950 font-semibold border border-brand-aloe/60 dark:bg-brand-aloe/10 dark:text-brand-aloe dark:border-brand-aloe/20 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    isActive
                      ? "text-neutral-950 dark:text-brand-aloe"
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/5 space-y-3 shadow-paper dark:shadow-none">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-brand-aloe text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Outbound Cap</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">Used today</span>
              <span className="text-neutral-900 dark:text-white font-medium">0 / 20</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-aloe h-full rounded-full" style={{ width: "0%" }}></div>
            </div>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">
            Safety rate-limiting keeps your sender domain healthy.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-200 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
        <span>SponsorFlow v0.1</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Ready
        </span>
      </div>
    </aside>
  );
}
