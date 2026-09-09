"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Check,
  RefreshCw,
  Edit3,
  Send,
  Building2,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export interface EmailDetail {
  id: string;
  company_id: string;
  to_name?: string | null;
  to_email: string;
  subject: string;
  body: string;
  status: string;
  ai_positioning_angle?: string | null;
  company?: {
    company_name: string;
    industry?: string | null;
    website?: string | null;
    personalization_hook?: string | null;
  } | null;
}

interface ApprovalModalProps {
  email: EmailDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged: (emailId: string, newStatus: string) => void;
}

export function ApprovalModal({
  email,
  isOpen,
  onClose,
  onStatusChanged,
}: ApprovalModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (email) {
      setSubject(email.subject);
      setBody(email.body);
      setIsEditing(false);
      setError("");
    }
  }, [email]);

  if (!isOpen || !email) return null;

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const isWordCountIdeal = wordCount >= 70 && wordCount <= 150;

  // Handle direct edit save
  const handleSaveEdits = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/emails/${email.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          status: "draft",
          user_edits: "Manual text edit by user",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save edited draft");
      }

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle regenerate with Claude
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError("");
    try {
      const res = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: email.company_id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to regenerate email");
      }

      setSubject(data.email?.subject || subject);
      setBody(data.email?.body || body);
      onStatusChanged(email.id, "draft");
    } catch (err: any) {
      setError(err.message || "Failed to regenerate email");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle Approve
  const handleApprove = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/emails/${email.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ready_to_send",
          subject,
          body,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve email");
      }

      onStatusChanged(email.id, "ready_to_send");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to approve email");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/emails/${email.id}/reject`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to reject email");
      }

      onStatusChanged(email.id, "rejected");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reject email");
    } finally {
      setIsSaving(false);
    }
  };

  const companyName = email.company?.company_name || "Target Sponsor";
  const industry = email.company?.industry || "Tech";
  const hook = email.company?.personalization_hook;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200/80 dark:border-white/5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-brand-aloe" />
              <h3 className="text-base font-semibold text-neutral-950 dark:text-white tracking-tight">
                Review Outreach Draft
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white">{companyName}</span>
              <Badge variant="outline">{industry}</Badge>
              {email.to_name && (
                <span className="text-neutral-500 dark:text-neutral-400">Contact: {email.to_name}</span>
              )}
            </div>
            {email.ai_positioning_angle && (
              <p className="text-[11px] text-emerald-800 dark:text-brand-aloe font-mono">
                Positioning Angle: {email.ai_positioning_angle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hook && (
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-white/5 text-[11px] text-neutral-700 dark:text-neutral-300">
              <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Company Context Hook:</span> {hook}
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Subject
            </label>
            {isEditing ? (
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-brand-aloe/80"
              />
            ) : (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200/80 dark:border-white/5 text-xs text-neutral-900 dark:text-white font-medium">
                {subject}
              </div>
            )}
          </div>

          {/* Email Body */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Email Message
              </label>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isWordCountIdeal
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                }`}
              >
                {wordCount} words {isWordCountIdeal ? "✓ (Target 70–150)" : "⚠ (Target 70–150)"}
              </span>
            </div>

            {isEditing ? (
              <textarea
                rows={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl p-3 text-xs text-neutral-900 dark:text-white font-mono leading-relaxed focus:outline-none focus:border-brand-aloe/80 resize-y"
              />
            ) : (
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200/80 dark:border-white/5 text-xs text-neutral-800 dark:text-neutral-200 font-mono leading-relaxed whitespace-pre-wrap">
                {body}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-neutral-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/80 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={isSaving}
                onClick={handleSaveEdits}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Save Edits
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Message
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={isRegenerating || isSaving}
              onClick={handleRegenerate}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-emerald-600 dark:text-brand-aloe" : ""}`} />
              Regenerate
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={handleReject}
              className="text-neutral-600 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
            >
              Reject Draft
            </Button>

            <Button
              variant="aloe"
              size="sm"
              disabled={isSaving || isRegenerating}
              onClick={handleApprove}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Approve & Queue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
