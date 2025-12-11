"use client";

import Link from "next/link";

export function AdminHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        
        {/* Brand */}
        <Link href="/admin" className="text-sm font-semibold tracking-tight text-neutral-900">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
            WSMath
          </span>{" "}
          <span className="text-neutral-500">Admin</span>
        </Link>

        {/* View Website Link */}
        <Link 
          href="/" 
          className="rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition"
        >
          View website ↗
        </Link>

      </div>
    </header>
  );
}
