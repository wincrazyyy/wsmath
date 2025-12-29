// app/_components/ui/book-button.tsx
"use client";

import miscContent from "@/app/_lib/content/json/misc.json";

type BookButtonVariant = "blue" | "green" | "plain" | "footer" | "nav";

type BookButtonProps = {
  buttonClassName?: string;
  ariaLabel?: string;
  href?: string;
  label?: string;
  subLabel?: string;
  variant?: BookButtonVariant;
  prefillText?: string;
};

const { whatsapp } = miscContent;

type VariantStyle = {
  bg: string;
  glow: string;
  ring: string;
  shadow: string;
  hoverShadow: string;
  focus: string;
  shell: string;
  text: string;
  showGlow: boolean;
  showArrow: boolean;
};

const VARIANTS: Record<BookButtonVariant, VariantStyle> = {
  blue: {
    bg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
    glow: "bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-500/25",
    ring: "ring-white/20",
    shadow: "shadow-violet-500/20",
    hoverShadow: "hover:shadow-violet-500/25",
    focus: "focus-visible:ring-violet-500",
    shell: "rounded-2xl px-5 py-3 shadow-lg ring-1",
    text: "text-white",
    showGlow: true,
    showArrow: true,
  },
  green: {
    bg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
    glow: "bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25",
    ring: "ring-white/20",
    shadow: "shadow-emerald-500/20",
    hoverShadow: "hover:shadow-emerald-500/25",
    focus: "focus-visible:ring-emerald-500",
    shell: "rounded-2xl px-5 py-3 shadow-lg ring-1",
    text: "text-white",
    showGlow: true,
    showArrow: true,
  },
  plain: {
    bg: "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900",
    glow: "bg-gradient-to-r from-neutral-900/20 via-neutral-700/15 to-neutral-900/20",
    ring: "ring-black/10",
    shadow: "shadow-black/10",
    hoverShadow: "hover:shadow-black/15",
    focus: "focus-visible:ring-neutral-900",
    shell: "rounded-2xl px-5 py-3 shadow-lg ring-1",
    text: "text-white",
    showGlow: true,
    showArrow: true,
  },
  nav: {
    bg: "bg-white/70 hover:bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60",
    glow: "bg-gradient-to-r from-indigo-500/28 via-violet-500/28 to-sky-500/28",
    ring: "ring-transparent",
    shadow: "shadow-sm",
    hoverShadow: "hover:shadow-md",
    focus: "focus-visible:ring-indigo-400/60",
    shell: [
      "h-11 rounded-xl px-4",
      "border border-neutral-200/80",
      "relative",
    ].join(" "),
    text: "text-neutral-900",
    showGlow: true,
    showArrow: false,
  },

  footer: {
    bg: "bg-neutral-900 hover:bg-neutral-800",
    glow: "bg-gradient-to-r from-transparent via-transparent to-transparent",
    ring: "ring-transparent",
    shadow: "shadow-none",
    hoverShadow: "hover:shadow-none",
    focus: "focus-visible:ring-neutral-900",
    shell: "rounded-xl px-4 py-2",
    text: "text-white",
    showGlow: false,
    showArrow: false,
  },
};

export function BookButton({
  buttonClassName = "",
  ariaLabel = "Book a lesson on WhatsApp",
  href,
  label = "Book a lesson",
  subLabel,
  variant = "blue",
  prefillText = whatsapp.prefillText,
}: BookButtonProps) {
  const defaultHref = `https://wa.me/${whatsapp.phoneNumber}?text=${encodeURIComponent(
    prefillText
  )}`;
  const finalHref = href ?? defaultHref;
  const v = VARIANTS[variant];

  const motion =
  variant === "nav"
    ? [
        "transition-all duration-200 ease-out",
        "hover:-translate-y-[1px] hover:scale-[1.02]",
        "active:translate-y-0 active:scale-[1.0]",
      ].join(" ")
    : "transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0";

  // stronger glow even when idle (nav only)
  const glowOpacity =
    variant === "nav"
      ? "opacity-70 group-hover:opacity-100"
      : "opacity-0 group-hover:opacity-100";

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={[
        "group inline-flex items-center justify-center gap-2",
        "text-sm font-semibold",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "relative isolate overflow-hidden",
        motion,
        v.bg,
        v.focus,
        v.text,
        v.shell,
        v.shadow,
        v.hoverShadow,
        buttonClassName,
      ].join(" ")}
    >
      {/* nav-only gradient border highlight (falls back gracefully if mask unsupported) */}
      {variant === "nav" ? (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 rounded-xl p-[1px]",
            "bg-gradient-to-r from-indigo-500/55 via-violet-500/55 to-sky-500/55",
            "opacity-55 transition-opacity duration-200 group-hover:opacity-100",
            "[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]",
            "[mask-composite:exclude]",
            "[-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]",
            "[-webkit-mask-composite:xor]",
          ].join(" ")}
        />
      ) : null}

      {/* glow layer */}
      {v.showGlow ? (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute -inset-4 rounded-[16px] blur-2xl",
            "transition-opacity duration-200",
            glowOpacity,
            v.glow,
          ].join(" ")}
        />
      ) : null}

      <span className="relative z-10 flex flex-col items-center leading-tight">
        <span>{label}</span>
        {subLabel ? (
          <span className="mt-0.5 text-[11px] font-normal text-neutral-700/80">
            {subLabel}
          </span>
        ) : null}
      </span>

      {variant === "nav" ? (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 rounded-xl",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          ].join(" ")}
        >
          {/* sheen streak */}
          <span
            aria-hidden
            className={[
              "absolute -inset-y-10 left-[-60%] w-[55%]",
              "rotate-[18deg]",
              "bg-gradient-to-r from-transparent via-white/55 to-transparent",
              "blur-[2px]",
              "transform-gpu",
              "transition-transform duration-700 ease-out",
              "group-hover:translate-x-[240%]",
            ].join(" ")}
          />
          {/* subtle inner highlight */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-xl bg-white/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        </span>
      ) : null}


      {/* arrow stays off for nav/footer */}
      {v.showArrow ? (
        <span
          aria-hidden
          className="relative translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      ) : null}
    </a>
  );
}
