// app/_components/ui/book-button.tsx
import miscContent from "@/app/_lib/content/json/misc.json";

type BookButtonVariant = "blue" | "green" | "plain" | "footer";

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
  blue: {
    bg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
    glow: "bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-500/25",
    ring: "ring-white/20",
    shadow: "shadow-violet-500/20",
    hoverShadow: "hover:shadow-violet-500/25",
    focus: "focus-visible:ring-violet-500",
  },
  green: {
    bg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
    glow: "bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25",
    ring: "ring-white/20",
    shadow: "shadow-emerald-500/20",
    hoverShadow: "hover:shadow-emerald-500/25",
    focus: "focus-visible:ring-emerald-500",
  },
  plain: {
    bg: "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900",
    glow: "bg-gradient-to-r from-neutral-900/20 via-neutral-700/15 to-neutral-900/20",
    ring: "ring-black/10",
    shadow: "shadow-black/10",
    hoverShadow: "hover:shadow-black/15",
    focus: "focus-visible:ring-neutral-900",
  },
  footer: {
    bg: "bg-neutral-900 hover:bg-neutral-800",
    glow: "bg-gradient-to-r from-transparent via-transparent to-transparent",
    ring: "ring-transparent",
    shadow: "shadow-none",
    hoverShadow: "hover:shadow-none",
    focus: "focus-visible:ring-neutral-900",
  },
};

export function BookButton({
  buttonClassName = "",
  ariaLabel = "Chat on WhatsApp",
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

  const isFooter = variant === "footer";

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={[
        "group relative inline-flex w-full items-center justify-center gap-2",
        "text-sm font-semibold text-white",
        "transition-transform duration-200 ease-out",
        "hover:-translate-y-0.5 active:translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        v.bg,
        v.focus,

        // default button shell
        !isFooter
          ? ["rounded-2xl px-5 py-3", "shadow-lg", v.shadow, "ring-1", v.ring, v.hoverShadow].join(" ")
          : [
              // footer original shell
              "rounded-xl px-4 py-2",
              // (footer original didn’t have ring/glow)
            ].join(" "),

        buttonClassName,
      ].join(" ")}
    >
      {/* glow layer (disabled visually in footer variant) */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute -inset-1 rounded-[18px] blur-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          v.glow,
          isFooter ? "hidden" : "",
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

      {/* remove arrow for footer variant */}
      {!isFooter && (
        <span
          aria-hidden
          className="relative translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      )}
    </a>
  );
}
