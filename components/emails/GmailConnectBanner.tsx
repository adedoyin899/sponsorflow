"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, LogOut, Shield } from "lucide-react";

export function GmailConnectBanner() {
  const [status, setStatus] = useState<{
    connected: boolean;
    email?: string | null;
  }>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/gmail/status");
      const data = await res.json();
      if (res.ok) {
        setStatus({ connected: data.connected, email: data.email });
      }
    } catch {
      setStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      if (res.ok) {
        setStatus({ connected: false });
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card
      variant="glass"
      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border transition-colors ${
        status.connected
          ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-brand-aloe/5"
          : "border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            status.connected
              ? "bg-emerald-100 text-emerald-800 dark:bg-brand-aloe/20 dark:text-brand-aloe"
              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
          }`}
        >
          <Mail className="w-5 h-5" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-950 dark:text-white">
              {status.connected ? "Gmail Dispatch Connected" : "Connect Your Gmail Inbox"}
            </span>
            {status.connected ? (
              <Badge variant="aloe" className="text-[10px] py-0">Active</Badge>
            ) : (
              <Badge variant="warning" className="text-[10px] py-0">Action Required</Badge>
            )}
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            {status.connected
              ? `Sending approved cold emails via ${status.email}. Safe limits: 20 emails/day, 5/hour.`
              : "Required for sending approved emails. Emails will be sent directly from your own personal inbox."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        {status.connected ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={isDisconnecting}
            onClick={handleDisconnect}
            className="text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 text-xs h-8 px-2.5 gap-1.5"
          >
            {isDisconnecting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            Disconnect
          </Button>
        ) : (
          <a href="/api/gmail/connect">
            <Button variant="aloe" size="sm" className="text-xs h-8 px-3 gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Connect Gmail
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}
