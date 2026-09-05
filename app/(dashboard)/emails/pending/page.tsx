"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApprovalModal, EmailDetail } from "@/components/emails/ApprovalModal";
import { GmailConnectBanner } from "@/components/emails/GmailConnectBanner";
import { RateLimitWidget } from "@/components/emails/RateLimitWidget";
import {
  Mail,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function PendingEmailsPage() {
  const [emails, setEmails] = useState<EmailDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "ready_to_send" | "all">("pending");

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emails");
      const data = await res.json();
      if (res.ok && data.emails) {
        setEmails(data.emails);
      }
    } catch (err) {
      console.error("Failed to load pending emails:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleOpenReview = (email: EmailDetail) => {
    setSelectedEmail(email);
    setIsModalOpen(true);
  };

  const handleStatusChanged = (emailId: string, newStatus: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, status: newStatus } : e))
    );
  };

  const pendingEmails = emails.filter((e) => e.status === "draft");
  const approvedEmails = emails.filter((e) => e.status === "ready_to_send");

  const filtered = emails.filter((e) => {
    if (statusFilter === "pending" && e.status !== "draft") return false;
    if (statusFilter === "ready_to_send" && e.status !== "ready_to_send") return false;

    if (search) {
      const q = search.toLowerCase();
      const compName = e.company?.company_name?.toLowerCase() || "";
      const subj = e.subject.toLowerCase();
      const contact = e.to_name?.toLowerCase() || "";
      return compName.includes(q) || subj.includes(q) || contact.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-aloe font-medium mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>Human-In-The-Loop Approval System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Pending Outreach Review
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Every AI email must be reviewed, edited, or approved by you before entering the outbound dispatch queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/emails/draft">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Draft New Email
            </Button>
          </Link>
          <Link href="/dashboard/emails">
            <Button variant="outline" size="sm">
              All Outreach
            </Button>
          </Link>
        </div>
      </div>

      <GmailConnectBanner />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
              Pending Review
            </span>
            <span className="text-2xl font-light text-amber-400">{pendingEmails.length}</span>
          </div>
          <Badge variant="outline" className="text-amber-400 border-amber-400/30">
            Awaiting Approval
          </Badge>
        </Card>

        <Card variant="glass" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
              Approved & Queued
            </span>
            <span className="text-2xl font-light text-brand-aloe">{approvedEmails.length}</span>
          </div>
          <Badge variant="aloe">Ready to Send</Badge>
        </Card>

        <Card variant="glass" className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 block font-medium">
              Total Drafted
            </span>
            <span className="text-2xl font-light text-white">{emails.length}</span>
          </div>
          <Badge variant="outline">All Outreach</Badge>
        </Card>
      </div>

      {/* Rate Limits & Batch Send Action */}
      <RateLimitWidget onDispatched={fetchEmails} readyCount={approvedEmails.length} />

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "pending"
                ? "bg-neutral-800 text-white font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Pending Review ({pendingEmails.length})
          </button>
          <button
            onClick={() => setStatusFilter("ready_to_send")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "ready_to_send"
                ? "bg-brand-aloe/20 text-brand-aloe font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Approved ({approvedEmails.length})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "all"
                ? "bg-neutral-800 text-white font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All ({emails.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-brand-aloe/50"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !isLoading && (
        <Card variant="glass" className="p-12 text-center space-y-3">
          <Mail className="w-10 h-10 text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">No outreach emails found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {statusFilter === "pending"
                ? "You have reviewed all pending drafts! Generate more outreach from your target sponsor directory."
                : "No emails match your active filter."}
            </p>
          </div>
          <Link href="/dashboard/emails/draft">
            <Button variant="aloe" size="sm" className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Draft New Email
            </Button>
          </Link>
        </Card>
      )}

      {/* Pending Review List */}
      <div className="space-y-3">
        {filtered.map((email) => {
          const compName = email.company?.company_name || "Target Sponsor";
          const industry = email.company?.industry || "Tech";
          const contactName = email.to_name || "Hiring Lead";

          return (
            <Card
              key={email.id}
              variant="glass"
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-all cursor-pointer"
              onClick={() => handleOpenReview(email)}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white text-sm tracking-tight">
                    {compName}
                  </span>
                  <span className="text-xs text-neutral-400">— Hi {contactName}</span>
                  <Badge variant="outline">{industry}</Badge>

                  {email.status === "draft" && (
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[10px]">
                      Pending Review
                    </Badge>
                  )}
                  {email.status === "ready_to_send" && (
                    <Badge variant="aloe" className="text-[10px]">
                      Approved ✓
                    </Badge>
                  )}
                  {email.status === "rejected" && (
                    <Badge variant="outline" className="text-red-400 border-red-400/30 text-[10px]">
                      Skipped
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-neutral-200 font-medium line-clamp-1">
                  Subject: {email.subject}
                </p>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-mono">
                  {email.body.slice(0, 140)}...
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <Button
                  variant={email.status === "ready_to_send" ? "secondary" : "aloe"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenReview(email);
                  }}
                  className="gap-1.5 text-xs"
                >
                  Review <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Interactive Review Modal */}
      <ApprovalModal
        email={selectedEmail}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmail(null);
        }}
        onStatusChanged={handleStatusChanged}
      />
    </div>
  );
}
