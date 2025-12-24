// app/_components/whatsapp-button.tsx
import miscContent from "@/app/_lib/content/json/misc.json";

type BookButtonVariant = "private" | "group";

type BookButtonProps = {
  /** Extra classes for the outer anchor */
  buttonClassName?: string;
  ariaLabel?: string;
  /** Optional override – if omitted, uses misc.json WhatsApp settings */
  href?: string;
  /** Button text (default: "Book a lesson") */
  label?: string;
  /** Optional small note under the label (kept inside button) */
  subLabel?: string;
  /** Color theme */
  variant?: BookButtonVariant;
};

const { whatsapp } = miscContent;

const VARIANTS: Record<
  BookButtonVariant,
  {
    bg: string;
    glow: string;
    ring: string;
    shadow: string;
    focus: string;
    hoverShadow: string;
  }
> = {
  private: {
    bg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
    glow: "bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-500/25",
    ring: "ring-white/20",
    shadow: "shadow-violet-500/20",
    hoverShadow: "hover:shadow-violet-500/25",
    focus: "focus-visible:ring-violet-500",
  },
  group: {
    // more “emerald / teal” vibe
    bg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
    glow: "bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25",
    ring: "ring-white/20",
    shadow: "shadow-emerald-500/20",
    hoverShadow: "hover:shadow-emerald-500/25",
    focus: "focus-visible:ring-emerald-500",
  },
};

export function BookButton({
  buttonClassName = "",
  ariaLabel = "Chat on WhatsApp",
  href,
  label = "Book a lesson",
  subLabel,
  variant = "private",
}: BookButtonProps) {
  const defaultHref = `https://wa.me/${whatsapp.phoneNumber}?text=${encodeURIComponent(
    whatsapp.prefillText
  )}`;

  const finalHref = href ?? defaultHref;
  const v = VARIANTS[variant];

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={[
        "group relative inline-flex w-full items-center justify-center gap-2",
        "rounded-2xl px-5 py-3 text-sm font-semibold text-white",
        v.bg,
        "shadow-lg",
        v.shadow,
        "ring-1",
        v.ring,
        "transition-transform duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-xl",
        v.hoverShadow,
        "active:translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        v.focus,
        buttonClassName,
      ].join(" ")}
    >
      {/* subtle glow */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute -inset-1 rounded-[18px] blur-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          v.glow,
        ].join(" ")}
      />

      <span className="relative flex flex-col items-center leading-tight">
        <span>{label}</span>
        {subLabel ? (
          <span className="mt-0.5 text-[11px] font-normal text-white/85">
            {subLabel}
          </span>
        ) : null}
      </span>

      <span
        aria-hidden
        className="relative translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </a>
  );
}
