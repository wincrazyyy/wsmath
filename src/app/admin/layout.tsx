import type { ReactNode } from "react";
import { AdminNav } from "./_components/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      <div className="pb-12 pt-6">
        {children}
      </div>
    </div>
  );
}
