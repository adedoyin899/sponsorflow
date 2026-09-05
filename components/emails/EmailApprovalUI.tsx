"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Edit3, Send, Sparkles } from "lucide-react";

export interface PendingEmail {
  id: string;
  companyName: string;
  contactName: string;
  industry: string;
  subject: string;
  status: "draft" | "ready_to_send" | "rejected";
}

export function EmailApprovalUI({ initialEmails }: { initialEmails?: PendingEmail[] }) {
  const [emails, setEmails] = useState<PendingEmail[]>(
    initialEmails || [
      {
        id: "1",
        companyName: "ClearBank",
        contactName: "Jane Smith",
        industry: "Fintech",
        subject: "Embedded finance + product design experience",
        status: "draft",
      },
      {
        id: "2",
        companyName: "Canva",
        contactName: "Alex Rivera",
        industry: "Design & SaaS",
        subject: "Design system tooling and accessibility architecture",
        status: "draft",
      },
      {
        id: "3",
        companyName: "Cloudflare",
        contactName: "Mark Hughes",
        industry: "Infrastructure",
        subject: "Developer experience + complex platform interfaces",
        status: "draft",
      },
    ]
  );

  const updateStatus = (id: string, newStatus: "ready_to_send" | "rejected") => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
  };

  const readyCount = emails.filter((e) => e.status === "ready_to_send").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Outreach Review Queue</h2>
          <p className="text-xs text-neutral-400">
            {readyCount} approved of {emails.length} drafted emails
          </p>
        </div>
        <Button variant="aloe" size="sm" disabled={readyCount === 0}>
          <Send className="w-3.5 h-3.5 mr-1" /> Send Approved Batch ({readyCount})
        </Button>
      </div>

      <div className="space-y-2.5">
        {emails.map((email) => (
          <Card
            key={email.id}
            variant="glass"
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">{email.companyName}</span>
                <span className="text-xs text-neutral-400">({email.contactName})</span>
                <Badge variant="outline">{email.industry}</Badge>
                {email.status === "ready_to_send" && <Badge variant="success">Approved</Badge>}
                {email.status === "rejected" && <Badge variant="danger">Skipped</Badge>}
              </div>
              <p className="text-xs text-neutral-300">{email.subject}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={email.status === "ready_to_send" ? "primary" : "secondary"}
                size="sm"
                onClick={() => updateStatus(email.id, "ready_to_send")}
              >
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Approve
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateStatus(email.id, "rejected")}
                className="text-neutral-400 hover:text-red-400"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
