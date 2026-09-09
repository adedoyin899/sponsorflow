import React from "react";
import { Header } from "@/components/dashboard/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen dashboard-shell bg-[#fbfbf5] dark:bg-black text-neutral-900 dark:text-white flex flex-col transition-colors duration-200">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto dashboard-main bg-[#fbfbf5] dark:bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
