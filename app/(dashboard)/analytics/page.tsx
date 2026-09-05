import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Mail, CheckCircle2 } from "lucide-react";

export default function AnalyticsDashboardPage() {
  const industries = [
    { name: "Fintech", sent: 18, opened: 12, replies: 6, positive: 4, rate: "33%" },
    { name: "Design SaaS", sent: 12, opened: 8, replies: 2, positive: 1, rate: "17%" },
    { name: "Infrastructure", sent: 10, opened: 6, replies: 2, positive: 1, rate: "20%" },
    { name: "HealthTech", sent: 8, opened: 4, replies: 1, positive: 0, rate: "12%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign Analytics</h1>
        <p className="text-xs text-neutral-400">
          Track response rates, open rates, and interview pipeline performance by industry and message angle.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 space-y-1">
          <span className="text-xs text-neutral-400">Average Open Rate</span>
          <p className="text-2xl font-bold text-white">62.5%</p>
          <span className="text-[11px] text-emerald-400 font-medium">↑ 14% vs industry baseline</span>
        </Card>
        <Card variant="glass" className="p-5 space-y-1">
          <span className="text-xs text-neutral-400">Average Reply Rate</span>
          <p className="text-2xl font-bold text-white">22.9%</p>
          <span className="text-[11px] text-emerald-400 font-medium">↑ High-intent personalized hooks</span>
        </Card>
        <Card variant="glass" className="p-5 space-y-1">
          <span className="text-xs text-neutral-400">Interviews Scheduled</span>
          <p className="text-2xl font-bold text-white">2</p>
          <span className="text-[11px] text-neutral-400">ClearBank, Canva</span>
        </Card>
      </div>

      {/* Performance by Industry Table */}
      <Card variant="glass" className="p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Performance by Target Industry</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/5 text-neutral-400 font-medium">
              <tr>
                <th className="pb-3">Industry</th>
                <th className="pb-3">Sent</th>
                <th className="pb-3">Opened</th>
                <th className="pb-3">Replies</th>
                <th className="pb-3">Positive</th>
                <th className="pb-3">Reply Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {industries.map((row) => (
                <tr key={row.name} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-medium text-white">{row.name}</td>
                  <td className="py-3">{row.sent}</td>
                  <td className="py-3">{row.opened}</td>
                  <td className="py-3">{row.replies}</td>
                  <td className="py-3 font-semibold text-emerald-400">{row.positive}</td>
                  <td className="py-3">
                    <Badge variant="aloe">{row.rate}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
