import type { ReactNode } from "react";
import { AdminHeader } from "./_components/admin-header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminHeader />
      <div className="pb-12 pt-6">
        {children}
      </div>
    </div>
  );
}
