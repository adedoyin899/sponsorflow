"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Sparkles,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
} from "lucide-react";

interface ReplyItem {
  id: string;
  from_email: string;
  from_name?: string | null;
  subject?: string | null;
  body: string;
  received_at: string;
  ai_classification: "positive" | "interested" | "rejection" | "question" | "out_of_office";
  ai_confidence: number;
  ai_summary?: string | null;
  suggested_action?: string | null;
  is_read: boolean;
  outreach_email?: {
    id: string;
    subject: string;
    company_id: string;
  } | null;
}

export default function RepliesDashboardPage() {
  const [replies, setReplies] = useState<ReplyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "positive" | "interested" | "rejection">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState("");

  const fetchReplies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/replies");
      const data = await res.json();
      if (res.ok && data.replies) {
        setReplies(data.replies);
      }
    } catch (err) {
      console.error("Failed to fetch replies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, []);

  const handleSimulate = async (type: "positive" | "interested" | "rejection") => {
    setIsSimulating(true);
    setFeedback("");
    try {
      const res = await fetch("/api/replies/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback(`Created and classified simulated ${type} reply!`);
        await fetchReplies();
      }
    } catch (err: any) {
      setFeedback(err.message || "Failed to simulate reply");
    } finally {
      setIsSimulating(false);
    }
  };

  const positiveCount = replies.filter((r) => r.ai_classification === "positive").length;
  const interestedCount = replies.filter((r) => r.ai_classification === "interested").length;
  const rejectionCount = replies.filter((r) => r.ai_classification === "rejection").length;

  const filtered = replies.filter((r) => {
    if (activeTab === "positive") return r.ai_classification === "positive";
    if (activeTab === "interested") return r.ai_classification === "interested";
    if (activeTab === "rejection") return r.ai_classification === "rejection";
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-brand-aloe font-medium mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Closed-Loop Intent Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-neutral-950 dark:text-white tracking-tight">
            Inbound Email Replies
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Incoming replies detected from Gmail are classified automatically with suggested action workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={isSimulating}
            onClick={() => handleSimulate("positive")}
            className="text-xs gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-brand-aloe" /> Simulate Positive
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isSimulating}
            onClick={() => handleSimulate("interested")}
            className="text-xs gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Simulate Warm
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-brand-aloe/10 border border-emerald-200 dark:border-brand-aloe/30 text-xs text-emerald-800 dark:text-brand-aloe flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-50/50 dark:bg-brand-aloe/5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-medium">
              🟢 Positive / Interview
            </span>
            <span className="text-2xl font-light text-emerald-700 dark:text-brand-aloe">{positiveCount}</span>
          </div>
          <Badge variant="aloe">High Priority</Badge>
        </Card>

        <Card variant="glass" className="p-4 flex items-center justify-between border-amber-400/20 bg-amber-50/50 dark:bg-amber-400/5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-medium">
              🟡 Warm Lead / Keep In Touch
            </span>
            <span className="text-2xl font-light text-amber-600 dark:text-amber-400">{interestedCount}</span>
          </div>
          <Badge variant="warning">Nurture</Badge>
        </Card>

        <Card variant="glass" className="p-4 flex items-center justify-between border-red-400/20 bg-red-50/50 dark:bg-red-400/5">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 block font-medium">
              🔴 Rejections / Closed
            </span>
            <span className="text-2xl font-light text-red-600 dark:text-red-400">{rejectionCount}</span>
          </div>
          <Badge variant="danger">Archived</Badge>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 text-xs w-fit">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "all" ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
          }`}
        >
          All ({replies.length})
        </button>
        <button
          onClick={() => setActiveTab("positive")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "positive" ? "bg-brand-aloe/30 dark:bg-brand-aloe/20 text-emerald-950 dark:text-brand-aloe font-semibold shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
          }`}
        >
          Positive ({positiveCount})
        </button>
        <button
          onClick={() => setActiveTab("interested")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "interested" ? "bg-amber-50 dark:bg-amber-400/20 text-amber-900 dark:text-amber-300 font-semibold shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
          }`}
        >
          Interested ({interestedCount})
        </button>
        <button
          onClick={() => setActiveTab("rejection")}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeTab === "rejection" ? "bg-red-50 dark:bg-red-400/20 text-red-900 dark:text-red-300 font-semibold shadow-sm" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
          }`}
        >
          Rejections ({rejectionCount})
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !isLoading && (
        <Card variant="glass" className="p-12 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-neutral-950 dark:text-white">No replies in this category yet</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
              Incoming responses will be parsed and classified here. You can use the "Simulate" buttons above to test the classification flow.
            </p>
          </div>
        </Card>
      )}

      {/* Replies List */}
      <div className="space-y-3">
        {filtered.map((reply) => {
          const isExpanded = expandedId === reply.id;
          const isPositive = reply.ai_classification === "positive";
          const isInterested = reply.ai_classification === "interested";
          const isRejection = reply.ai_classification === "rejection";

          return (
            <Card
              key={reply.id}
              variant="glass"
              className="p-5 space-y-3 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-neutral-950 dark:text-white text-sm">
                      {reply.from_name || reply.from_email}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {reply.from_email}
                    </span>

                    {isPositive && (
                      <Badge variant="aloe" className="text-[10px]">
                        🟢 Positive ({reply.ai_confidence}%)
                      </Badge>
                    )}
                    {isInterested && (
                      <Badge variant="warning" className="text-[10px]">
                        🟡 Interested ({reply.ai_confidence}%)
                      </Badge>
                    )}
                    {isRejection && (
                      <Badge variant="danger" className="text-[10px]">
                        🔴 Rejection ({reply.ai_confidence}%)
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {reply.subject || "Re: Outreach"}
                  </p>

                  {reply.ai_summary && (
                    <p className="text-xs text-emerald-700 dark:text-brand-mint font-medium">
                      AI Summary: {reply.ai_summary}
                    </p>
                  )}

                  {reply.suggested_action && (
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 pt-0.5">
                      <span className="text-neutral-800 dark:text-neutral-500 font-semibold">Suggested Action:</span>
                      <span>{reply.suggested_action}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : reply.id)}
                    className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white text-xs h-8 px-2"
                  >
                    {isExpanded ? (
                      <>
                        Hide <ChevronUp className="w-3.5 h-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        View Full Reply <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>

                  {isPositive && (
                    <a href={`mailto:${reply.from_email}?subject=${encodeURIComponent(reply.subject || "Re: Let's connect")}`}>
                      <Button variant="aloe" size="sm" className="gap-1.5 h-8 text-xs">
                        <Send className="w-3.5 h-3.5" /> Reply Now
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Full Email Message Box */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-neutral-200/70 dark:border-white/5 space-y-2 text-xs">
                  <div className="bg-neutral-50 dark:bg-neutral-900/90 rounded-xl p-4 text-neutral-800 dark:text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed border border-neutral-200/80 dark:border-neutral-800">
                    {reply.body}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
