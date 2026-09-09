"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Send, MessageSquare, Target } from "lucide-react";

export interface DashboardStatsProps {
  totalCompanies?: number;
  totalContacted?: number;
  totalReplied?: number;
  interviewsCount?: number;
}

export function DashboardStats(props: DashboardStatsProps) {
  const [counts, setCounts] = useState({
    totalCompanies: props.totalCompanies ?? 54,
    totalContacted: props.totalContacted ?? 0,
    totalReplied: props.totalReplied ?? 0,
    interviewsCount: props.interviewsCount ?? 0,
  });

  useEffect(() => {
    if (props.totalContacted !== undefined && props.totalContacted > 0) {
      setCounts({
        totalCompanies: props.totalCompanies ?? 54,
        totalContacted: props.totalContacted,
        totalReplied: props.totalReplied ?? 0,
        interviewsCount: props.interviewsCount ?? 0,
      });
      return;
    }

    fetch("/api/analytics?timeframe=30d")
      .then((res) => res.json())
      .then((data) => {
        if (data.analytics?.kpis) {
          const k = data.analytics.kpis;
          setCounts({
            totalCompanies: k.totalCompanies || 54,
            totalContacted: k.totalContacted || 0,
            totalReplied: k.repliesReceived || 0,
            interviewsCount: k.interviewsScheduled || 0,
          });
        }
      })
      .catch(() => {});
  }, [props.totalCompanies, props.totalContacted, props.totalReplied, props.interviewsCount]);

  const replyRate =
    counts.totalContacted > 0
      ? ((counts.totalReplied / counts.totalContacted) * 100).toFixed(0)
      : "0";

  const statItems = [
    {
      name: "Companies Targeted",
      value: counts.totalCompanies.toString(),
      subtext: "UK tech sponsors loaded",
      icon: Building2,
      accent: "text-brand-aloe",
      bg: "bg-brand-aloe/10",
    },
    {
      name: "Emails Sent",
      value: counts.totalContacted.toString(),
      subtext: "Personalized outreach",
      icon: Send,
      accent: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      name: "Inbound Replies",
      value: counts.totalReplied.toString(),
      subtext: `${replyRate}% response rate`,
      icon: MessageSquare,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Interviews Active",
      value: counts.interviewsCount.toString(),
      subtext: "Pipeline conversations",
      icon: Target,
      accent: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} variant="glass" className="p-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">{stat.name}</span>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
              <p className="text-xs text-neutral-500 mt-0.5">{stat.subtext}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
