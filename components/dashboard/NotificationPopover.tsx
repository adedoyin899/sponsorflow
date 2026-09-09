"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  Mail,
  Building2,
  BarChart3,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface NotificationItem {
  id: string;
  type: "reply" | "draft" | "limit" | "system";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl: string;
  actionLabel: string;
  accentColor: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "reply",
    title: "New Inbound Reply: ClearBank",
    description: "Jane Smith (VP of Product) responded with positive intent and requested a 15-minute intro call.",
    timestamp: "12m ago",
    isRead: false,
    actionUrl: "/dashboard/replies",
    actionLabel: "View Reply",
    accentColor: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
  },
  {
    id: "notif-2",
    type: "draft",
    title: "3 Outreach Drafts Ready for Review",
    description: "Claude synthesized positioning for Canva, Cloudflare, and Atlassian. Approval required to send.",
    timestamp: "45m ago",
    isRead: false,
    actionUrl: "/dashboard/emails/pending",
    actionLabel: "Review Drafts",
    accentColor: "text-brand-aloe bg-brand-aloe/10 border-brand-aloe/20",
  },
  {
    id: "notif-3",
    type: "limit",
    title: "Daily Dispatch Cap Update",
    description: "5 of 20 emails safely sent today via Gmail OAuth. Next delivery batch scheduled for 14:00.",
    timestamp: "2h ago",
    isRead: true,
    actionUrl: "/dashboard/analytics",
    actionLabel: "View Analytics",
    accentColor: "text-sky-400 bg-sky-400/10 border-sky-500/20",
  },
  {
    id: "notif-4",
    type: "system",
    title: "Sponsor Rating Verified",
    description: "54 UK tech sponsors confirmed on the official Worker Skilled Worker register.",
    timestamp: "1d ago",
    isRead: true,
    actionUrl: "/dashboard/companies",
    actionLabel: "Directory",
    accentColor: "text-purple-400 bg-purple-400/10 border-purple-500/20",
  },
];

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sponsorflow_notifications");
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  // Save changes
  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    try {
      localStorage.setItem("sponsorflow_notifications", JSON.stringify(items));
    } catch (_) {}
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    saveNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    saveNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const filteredItems = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-neutral-400 hover:text-white dark:hover:text-white hover:bg-neutral-800/60 dark:hover:bg-white/5 transition-all"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-aloe opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl z-50 p-4 border border-white/10 dark:border-white/10 bg-neutral-950/95 dark:bg-neutral-950/95 text-white animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="aloe" className="text-[10px] px-1.5 py-0.2">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-brand-aloe hover:underline inline-flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[11px] text-neutral-400 hover:text-red-400 inline-flex items-center"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-2.5 pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-white/10 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                filter === "unread"
                  ? "bg-white/10 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="space-y-2 mt-1 max-h-[340px] overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs">
                <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40 text-brand-aloe" />
                <span>No notifications in this view</span>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                    item.isRead
                      ? "bg-white/[0.02] border-white/5 opacity-75 hover:opacity-100 hover:bg-white/[0.04]"
                      : "bg-white/[0.06] border-white/10 hover:border-brand-aloe/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1 rounded-lg border text-[10px] ${item.accentColor}`}
                      >
                        {item.type === "reply" && <MessageSquare className="w-3 h-3" />}
                        {item.type === "draft" && <Mail className="w-3 h-3" />}
                        {item.type === "limit" && <BarChart3 className="w-3 h-3" />}
                        {item.type === "system" && <Building2 className="w-3 h-3" />}
                      </span>
                      <span className="font-semibold text-white tracking-tight">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 leading-relaxed pl-7">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pl-7 pt-1">
                    <Link
                      href={item.actionUrl}
                      onClick={() => {
                        markAsRead(item.id);
                        setIsOpen(false);
                      }}
                      className="text-[11px] text-brand-aloe hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      {item.actionLabel} <ExternalLink className="w-2.5 h-2.5" />
                    </Link>

                    {!item.isRead && (
                      <span className="text-[10px] text-neutral-400 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
