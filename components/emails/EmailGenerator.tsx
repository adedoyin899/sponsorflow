"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  RefreshCw,
  Send,
  CheckCircle2,
  Building2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export interface EmailGeneratorProps {
  initialCompanyId?: string;
  onEmailUpdated?: () => void;
}

interface CompanyOption {
  id: string;
  company_name: string;
  industry: string | null;
  personalization_hook: string | null;
  website: string | null;
}

export function EmailGenerator({
  initialCompanyId,
  onEmailUpdated,
}: EmailGeneratorProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || "");
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);

  const [currentEmailId, setCurrentEmailId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [positioningAngle, setPositioningAngle] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0.95);
  const [aiModel, setAiModel] = useState<string>("claude-3-5-sonnet");

  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState<string>("");

  // 1. Fetch available companies for the dropdown
  useEffect(() => {
    async function loadCompanies() {
      setIsLoadingCompanies(true);
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        if (res.ok && data.companies && data.companies.length > 0) {
          setCompanies(data.companies);
          const initial = initialCompanyId
            ? data.companies.find((c: any) => c.id === initialCompanyId)
            : data.companies[0];
          if (initial) {
            setSelectedCompanyId(initial.id);
            setSelectedCompany(initial);
          }
        }
      } catch (err) {
        console.error("Failed to load companies for generator:", err);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, [initialCompanyId]);

  // 2. Generate email draft when company changes or when triggered
  const handleGenerate = async (compId: string) => {
    if (!compId) return;
    setIsGenerating(true);
    setError("");
    setIsApproved(false);

    try {
      const res = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: compId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate draft with Claude");
      }

      setCurrentEmailId(data.email?.id || null);
      setSubject(data.email?.subject || "");
      setBody(data.email?.body || "");
      setPositioningAngle(data.positioning_angle || "Personalized Positioning");
      setConfidence(data.confidence || 0.95);
      setAiModel(data.model || "claude-3-5-sonnet");

      if (onEmailUpdated) onEmailUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to generate email");
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger initial generation once company is selected
  useEffect(() => {
    if (selectedCompanyId && !currentEmailId && !isGenerating) {
      handleGenerate(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const handleCompanyChange = (id: string) => {
    setSelectedCompanyId(id);
    const comp = companies.find((c) => c.id === id) || null;
    setSelectedCompany(comp);
    handleGenerate(id);
  };

  // 3. Approve and move draft to "ready_to_send"
  const handleApprove = async () => {
    if (!currentEmailId) return;
    setIsApproving(true);
    setError("");

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_id: currentEmailId,
          status: "ready_to_send",
          subject,
          body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve email");
      }

      setIsApproved(true);
      if (onEmailUpdated) onEmailUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to approve email");
    } finally {
      setIsApproving(false);
    }
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const isWordCountIdeal = wordCount >= 70 && wordCount <= 150;

  return (
    <Card variant="glass" className="p-6 space-y-6">
      {/* Company Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-aloe" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">
              Claude AI Generation Engine
            </span>
          </div>

          <div className="relative max-w-sm">
            <select
              value={selectedCompanyId}
              onChange={(e) => handleCompanyChange(e.target.value)}
              disabled={isLoadingCompanies || isGenerating}
              className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 pr-8 text-xs text-white focus:outline-none focus:border-brand-aloe/50 font-medium"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} — {c.industry || "Tech"}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {selectedCompany?.personalization_hook && (
            <p className="text-[11px] text-neutral-400 line-clamp-1">
              Hook: <span className="text-neutral-300">{selectedCompany.personalization_hook}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleGenerate(selectedCompanyId)}
            disabled={isGenerating || !selectedCompanyId}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-brand-aloe" : ""}`} />
            Regenerate
          </Button>

          <Button
            variant={isApproved ? "secondary" : "aloe"}
            size="sm"
            onClick={handleApprove}
            disabled={isApproved || isApproving || isGenerating || !currentEmailId}
            className="gap-1.5"
          >
            {isApproved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved
              </>
            ) : isApproving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Approving...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Approve & Queue
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Meta Indicators */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {positioningAngle && (
          <Badge variant="outline" className="border-brand-aloe/30 text-brand-aloe">
            Angle: {positioningAngle}
          </Badge>
        )}
        <Badge variant="outline" className="text-neutral-400">
          Model: {aiModel}
        </Badge>
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
            isWordCountIdeal ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {wordCount} words {isWordCountIdeal ? "✓ (Ideal 70–150)" : "⚠ (Target 70–150)"}
        </span>
      </div>

      {/* Draft Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setIsApproved(false);
            }}
            placeholder="Subject line will be generated by Claude..."
            disabled={isGenerating}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:border-brand-aloe/50 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-neutral-400">
              Personalized Email Body
            </label>
            <span className="text-[11px] text-neutral-500">
              Click to edit directly before approving
            </span>
          </div>
          <textarea
            rows={9}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setIsApproved(false);
            }}
            placeholder={
              isGenerating
                ? "Connecting candidate positioning to company hook via Claude..."
                : "Email body will appear here..."
            }
            disabled={isGenerating}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-xs text-white font-mono leading-relaxed focus:border-brand-aloe/50 focus:outline-none resize-y"
          />
        </div>
      </div>
    </Card>
  );
}
