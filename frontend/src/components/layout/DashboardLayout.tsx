import { Sidebar } from "./Sidebar";
import { type ReactNode } from "react";

interface DashboardLayoutProps {
  role: 'admin' | 'field_agent';
  children?: ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar role={role} />
      <main className="flex-1 lg:pl-64">
        <div className="p-4 md:p-8 ">
          {children}
        </div>
      </main>
    </div>
  );
}
