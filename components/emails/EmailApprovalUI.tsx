"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Mail,
  Building2,
} from "lucide-react";

export interface PendingEmail {
  id: string;
  company_id: string;
  to_name?: string | null;
  to_email: string;
  subject: string;
  body: string;
  status: "draft" | "ready_to_send" | "rejected" | "sent" | "delivered";
  ai_positioning_angle?: string | null;
  company?: {
    company_name: string;
    industry?: string | null;
    website?: string | null;
  } | null;
}

export function EmailApprovalUI({ refreshTrigger }: { refreshTrigger?: number }) {
  const [emails, setEmails] = useState<PendingEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      if (res.ok && data.emails) {
        setEmails(data.emails);
      }
    } catch (err) {
      console.error("Failed to fetch review emails:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [refreshTrigger]);

  const updateStatus = async (
    emailId: string,
    newStatus: "ready_to_send" | "rejected" | "draft"
  ) => {
    setActionLoadingId(emailId);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_id: emailId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setEmails((prev) =>
          prev.map((e) => (e.id === emailId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      console.error("Failed to update email status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const readyCount = emails.filter((e) => e.status === "ready_to_send").length;
  const draftCount = emails.filter((e) => e.status === "draft").length;

  const filtered = emails.filter((e) => {
    if (activeTab === "pending") return e.status === "draft";
    if (activeTab === "approved") return e.status === "ready_to_send";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Batch Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Outreach Review Queue</h2>
          <p className="text-xs text-neutral-400">
            {readyCount} approved of {emails.length} generated drafts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-[11px]">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "pending"
                  ? "bg-neutral-800 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "approved"
                  ? "bg-brand-aloe/20 text-brand-aloe font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Approved ({readyCount})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-neutral-800 text-white font-medium"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              All ({emails.length})
            </button>
          </div>
        </div>
      </div>

      {/* Email Cards List */}
      {filtered.length === 0 && !isLoading && (
        <Card variant="glass" className="p-8 text-center space-y-2">
          <Mail className="w-8 h-8 text-neutral-600 mx-auto" />
          <p className="text-xs text-neutral-400">
            {activeTab === "pending"
              ? "No draft emails pending review. Select a company above to generate a draft!"
              : activeTab === "approved"
              ? "No approved emails yet. Review and approve drafts to prepare your sending queue."
              : "No outreach emails created yet."}
          </p>
        </Card>
      )}

      <div className="space-y-2.5">
        {filtered.map((email) => {
          const isExpanded = expandedId === email.id;
          const companyName = email.company?.company_name || "Target Sponsor";
          const industry = email.company?.industry || "Tech";

          return (
            <Card
              key={email.id}
              variant="glass"
              className="p-4 space-y-3 transition-colors border border-white/5 hover:border-white/10"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {companyName}
                    </span>
                    {email.to_name && (
                      <span className="text-xs text-neutral-400">({email.to_name})</span>
                    )}
                    <Badge variant="outline">{industry}</Badge>
                    {email.status === "ready_to_send" && (
                      <Badge variant="aloe">Approved</Badge>
                    )}
                    {email.status === "draft" && (
                      <Badge variant="outline" className="text-amber-400 border-amber-400/30">
                        Draft
                      </Badge>
                    )}
                    {email.status === "rejected" && (
                      <Badge variant="outline" className="text-red-400 border-red-400/30">
                        Skipped
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs font-medium text-neutral-200">{email.subject}</p>

                  {email.ai_positioning_angle && (
                    <span className="text-[10px] text-neutral-400 block">
                      Angle: {email.ai_positioning_angle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : email.id)}
                    className="text-neutral-400 hover:text-white text-xs h-8 px-2"
                  >
                    {isExpanded ? (
                      <>
                        Hide <ChevronUp className="w-3.5 h-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        Preview <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>

                  {email.status !== "ready_to_send" ? (
                    <Button
                      variant="aloe"
                      size="sm"
                      disabled={actionLoadingId === email.id}
                      onClick={() => updateStatus(email.id, "ready_to_send")}
                      className="gap-1 h-8"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={actionLoadingId === email.id}
                      onClick={() => updateStatus(email.id, "draft")}
                      className="h-8 text-xs text-neutral-300"
                    >
                      Undo
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={actionLoadingId === email.id}
                    onClick={() => updateStatus(email.id, "rejected")}
                    className="text-neutral-500 hover:text-red-400 h-8 px-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Expandable Email Body View */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs">
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Recipient: {email.to_email}
                  </div>
                  <div className="bg-neutral-900/90 rounded-xl p-3 text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {email.body}
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
