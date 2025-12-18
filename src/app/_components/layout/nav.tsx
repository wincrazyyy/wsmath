"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { WhatsAppButton } from "../ui/whatsapp-button";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#packages", label: "Packages" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#results", label: "Results" },
];

const HIDE_AFTER_PX = 48; // scroll distance before nav fades out
const REVEAL_ZONE_H = 20; // px height at top for hover-to-reveal

export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // --- fade logic ---
  const [scrolledPast, setScrolledPast] = useState(false);
  const [hoverTop, setHoverTop] = useState(false);
  const [hoverNav, setHoverNav] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolledPast(window.scrollY > HIDE_AFTER_PX);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const visible = open || hoverTop || hoverNav || !scrolledPast;
  const hidden = !visible && scrolledPast && !open;

  // --- active section observer ---
  useEffect(() => {
    const ids = ["about", "packages", "testimonials", "results"] as const;
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(`#${best.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onHashChange = () => setOpen(false);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const linkClass = (href: string) =>
    `transition ${
      active === href ? "text-neutral-900 font-medium" : "text-neutral-600"
    } hover:text-neutral-900`;

  const goHomeNoHash = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Invisible hover zone that reveals the nav */}
      <div
        className="fixed inset-x-0 top-0 z-50"
        style={{ height: REVEAL_ZONE_H }}
        onMouseEnter={() => setHoverTop(true)}
        onMouseLeave={() => setHoverTop(false)}
      />

      {/* Small indicator when nav is hidden */}
      <div
        className={[
          "fixed top-0 left-1/2 -translate-x-1/2 z-[60]",
          "transition-all duration-300 ease-out",
          hidden
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 pointer-events-none",
        ].join(" ")}
        style={{ height: REVEAL_ZONE_H }}
        onMouseEnter={() => setHoverTop(true)}
        onMouseLeave={() => setHoverTop(false)}
        aria-hidden={!hidden}
      >
        <div className="mt-1 flex items-center justify-center">
          <div className="flex items-center rounded-full border border-neutral-200/80 bg-white/70 px-3 py-1 shadow-sm backdrop-blur">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="animate-bounce"
              aria-hidden="true"
            >
              <path
                d="M6 14l6-6 6 6"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Nav wrapper that fades out/in */}
      <div
        className={[
          "fixed inset-x-0 top-0 z-40",
          "transition-all duration-300 ease-out",
          visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none",
        ].join(" ")}
        onMouseEnter={() => setHoverNav(true)}
        onMouseLeave={() => setHoverNav(false)}
        onFocusCapture={() => setHoverNav(true)}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (!next || !e.currentTarget.contains(next)) setHoverNav(false);
        }}
      >
        <div className="w-full border-b border-neutral-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <nav className="container mx-auto max-w-5xl px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Brand (scroll to top, no hash) */}
              <button
                type="button"
                onClick={goHomeNoHash}
                className="flex items-center gap-2"
                aria-label="WSMath Home"
              >
                <Image
                  src="/icon.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="font-semibold tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
                    WSMath
                  </span>
                </span>
              </button>

              {/* Desktop nav */}
              <div className="hidden items-center gap-6 md:flex">
                {LINKS.map(({ href, label }) => (
                  <a key={href} href={href} className={linkClass(href)}>
                    {label}
                  </a>
                ))}
                <WhatsAppButton width={160} height={44} imgClassName="h-10 w-auto" />
              </div>

              {/* Mobile open */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm md:hidden"
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={open}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile menu */}
          <div
            id="mobile-menu"
            className={`fixed inset-0 z-50 md:hidden transition-opacity ${
              open
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!open}
          >
            <div className="absolute inset-0 bg-black/25" onClick={() => setOpen(false)} />
            <div className="absolute inset-x-0 top-0 rounded-b-2xl border-b border-neutral-200 bg-white p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goHomeNoHash}
                  className="flex items-center gap-2"
                  aria-label="WSMath Home"
                >
                  <Image src="/icon.svg" alt="" width={20} height={20} className="h-5 w-5" />
                  <span className="font-semibold">WSMath</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700"
                  aria-label="Close menu"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {LINKS.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-base text-neutral-700 hover:bg-neutral-50"
                  >
                    {label}
                  </a>
                ))}

                <div onClick={() => setOpen(false)}>
                  <WhatsAppButton
                    width={160}
                    height={44}
                    imgClassName="h-10 w-auto"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
