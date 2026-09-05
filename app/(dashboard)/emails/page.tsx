import React from "react";
import { EmailGenerator } from "@/components/emails/EmailGenerator";
import { EmailApprovalUI } from "@/components/emails/EmailApprovalUI";

export default function EmailsDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Outreach Engine & Drafts</h1>
        <p className="text-xs text-neutral-400">
          Generate AI cold emails with Claude, review personalized hooks, and approve for sending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white">Interactive Email Generator</h2>
          <EmailGenerator companyName="ClearBank" contactName="Jane Smith" industry="Fintech" />
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white">Pending Approval Queue</h2>
          <EmailApprovalUI />
        </div>
      </div>
    </div>
  );
}
