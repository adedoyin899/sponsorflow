"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export function RateLimitWidget({
  onDispatched,
  readyCount = 0,
}: {
  onDispatched?: () => void;
  readyCount?: number;
}) {
  const [limits, setLimits] = useState<{
    daily_limit: number;
    hourly_limit: number;
    emails_sent_today: number;
    emails_sent_this_hour: number;
    remaining_today: number;
    remaining_this_hour: number;
    can_send: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fetchLimits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emails/rate-limit");
      const data = await res.json();
      if (res.ok) {
        setLimits(data);
      }
    } catch (err) {
      console.error("Failed to load rate limits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const handleBatchSend = async () => {
    setIsSendingBatch(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/emails/batch-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Batch send failed");
      }

      if (data.sent > 0) {
        setStatusMessage(
          `Dispatched ${data.sent} email${data.sent > 1 ? "s" : ""} via Gmail! ${
            data.rate_limit_hit ? `(${data.stop_reason})` : ""
          }`
        );
      } else {
        setStatusMessage(data.message || "No emails were dispatched.");
      }

      await fetchLimits();
      if (onDispatched) onDispatched();
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to dispatch batch");
    } finally {
      setIsSendingBatch(false);
    }
  };

  if (isLoading || !limits) return null;

  const maxBatchNow = Math.min(readyCount, limits.remaining_this_hour, limits.remaining_today);

  return (
    <Card variant="glass" className="p-5 space-y-4 border border-white/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-aloe" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
            Safe Dispatch & Inbox Rate Limits
          </h3>
        </div>

        <span className="text-[11px] text-neutral-400 font-mono">
          Strict 20/day · 5/hour max to preserve deliverability
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Daily Limit Bar */}
        <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Daily Quota</span>
            <span className="font-semibold text-white font-mono">
              {limits.emails_sent_today} / {limits.daily_limit} sent
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                limits.emails_sent_today >= limits.daily_limit
                  ? "bg-amber-400"
                  : "bg-brand-aloe"
              }`}
              style={{
                width: `${Math.min(100, (limits.emails_sent_today / limits.daily_limit) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-neutral-500">
            {limits.remaining_today} emails remaining today
          </div>
        </div>

        {/* Hourly Limit Bar */}
        <div className="space-y-1.5 p-3 rounded-xl bg-neutral-900/60 border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Hourly Window</span>
            <span className="font-semibold text-white font-mono">
              {limits.emails_sent_this_hour} / {limits.hourly_limit} sent
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                limits.emails_sent_this_hour >= limits.hourly_limit
                  ? "bg-amber-400"
                  : "bg-brand-mint"
              }`}
              style={{
                width: `${Math.min(100, (limits.emails_sent_this_hour / limits.hourly_limit) * 100)}%`,
              }}
            />
          </div>
          <div className="text-[10px] text-neutral-500">
            {limits.remaining_this_hour} emails remaining this hour
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 text-xs text-neutral-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-aloe flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Batch Send Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs text-neutral-400">
          Ready to dispatch: <strong className="text-white">{readyCount}</strong> approved emails
          {maxBatchNow < readyCount && (
            <span className="text-amber-400 ml-1">
              (capped at {maxBatchNow} due to rate limits)
            </span>
          )}
        </div>

        <Button
          variant="aloe"
          size="sm"
          disabled={isSendingBatch || readyCount === 0 || !limits.can_send}
          onClick={handleBatchSend}
          className="gap-1.5 text-xs h-8 px-4"
        >
          {isSendingBatch ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Dispatching Emails...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" /> Dispatch Approved Batch ({maxBatchNow})
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
