"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Send, CheckCircle2 } from "lucide-react";

export interface EmailGeneratorProps {
  companyName?: string;
  contactName?: string;
  industry?: string;
  onApprove?: (email: { subject: string; body: string }) => void;
}

export function EmailGenerator({
  companyName = "ClearBank",
  contactName = "Jane Smith",
  industry = "Fintech",
  onApprove,
}: EmailGeneratorProps) {
  const [subject, setSubject] = useState("Embedded finance + product design experience");
  const [body, setBody] = useState(
    `Hi ${contactName},\n\nI came across ClearBank while researching leading UK fintech engineering and design teams. Given your focus on modern cloud banking infrastructure, I wanted to introduce myself.\n\nI'm a Product Designer with extensive experience untangling complex fintech flows. In my previous work, I redesigned a multi-step onboarding flow that cut user drop-off by 40%.\n\nWould you be open to a brief conversation about how I might support ClearBank's product design initiatives?\n\nPortfolio: https://portfolio.example.com\nLinkedIn: https://linkedin.com/in/example\n\nBest,\nDoyin`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    // Simulate generation or call API
    setTimeout(() => {
      setBody(
        `Hi ${contactName},\n\nI've been following ClearBank's growth in clearing and embedded banking. As a designer who specializes in high-friction technical workflows, I admire the elegance of your platform.\n\nI recently led end-to-end design for financial dashboards, improving task completion times significantly while ensuring compliance.\n\nI'd love to connect and share a few case studies if your team has any upcoming design needs.\n\nPortfolio: https://portfolio.example.com\nLinkedIn: https://linkedin.com/in/example\n\nBest,\nDoyin`
      );
      setIsGenerating(false);
    }, 1000);
  };

  const handleApprove = () => {
    setIsApproved(true);
    if (onApprove) {
      onApprove({ subject, body });
    }
  };

  return (
    <Card variant="glass" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{companyName}</h3>
            <Badge variant="aloe">{industry}</Badge>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">Contact: {contactName}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerate}
            isLoading={isGenerating}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
          </Button>
          <Button
            variant={isApproved ? "secondary" : "aloe"}
            size="sm"
            onClick={handleApprove}
            disabled={isApproved}
          >
            {isApproved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Approved
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1" /> Approve & Queue
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:border-brand-aloe/50 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-neutral-400">Body</label>
            <span className="text-[11px] text-neutral-500">
              {body.split(/\s+/).filter(Boolean).length} words (Target: 70–150)
            </span>
          </div>
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-sm text-white font-mono text-xs leading-relaxed focus:border-brand-aloe/50 focus:outline-none resize-y"
          />
        </div>
      </div>
    </Card>
  );
}
