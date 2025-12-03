"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/home", label: "Home content" },
  { href: "/admin/about", label: "About section" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/misc", label: "Misc items" },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href === "/admin/home" && pathname === "/admin");

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

        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 transition ${
                isActive(link.href)
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-sky-500 text-white shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
