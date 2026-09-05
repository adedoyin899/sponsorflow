import React from "react";
import { Card } from "@/components/ui/card";
import { Building2, Send, MessageSquare, Target, CheckCircle2 } from "lucide-react";

export interface DashboardStatsProps {
  totalCompanies?: number;
  totalContacted?: number;
  totalReplied?: number;
  interviewsCount?: number;
}

export function DashboardStats({
  totalCompanies = 54,
  totalContacted = 0,
  totalReplied = 0,
  interviewsCount = 0,
}: DashboardStatsProps) {
  const replyRate = totalContacted > 0 ? ((totalReplied / totalContacted) * 100).toFixed(0) : "0";

  const stats = [
    {
      name: "Companies Targeted",
      value: totalCompanies.toString(),
      subtext: "UK tech sponsors loaded",
      icon: Building2,
      accent: "text-brand-aloe",
      bg: "bg-brand-aloe/10",
    },
    {
      name: "Emails Sent",
      value: totalContacted.toString(),
      subtext: "Personalized outreach",
      icon: Send,
      accent: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      name: "Inbound Replies",
      value: totalReplied.toString(),
      subtext: `${replyRate}% response rate`,
      icon: MessageSquare,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      name: "Interviews Active",
      value: interviewsCount.toString(),
      subtext: "Pipeline conversations",
      icon: Target,
      accent: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
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
