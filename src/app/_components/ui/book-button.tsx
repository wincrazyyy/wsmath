// app/_components/whatsapp-button.tsx
import miscContent from "@/app/_lib/content/json/misc.json";

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
};

const { whatsapp } = miscContent;

export function BookButton({
  buttonClassName = "",
  ariaLabel = "Chat on WhatsApp",
  href,
  label = "Book a lesson",
  subLabel,
}: BookButtonProps) {
  // Default wa.me link from misc.json
  const defaultHref = `https://wa.me/${whatsapp.phoneNumber}?text=${encodeURIComponent(
    whatsapp.prefillText
  )}`;

  const finalHref = href ?? defaultHref;

  return (
    <a
      href={finalHref}
      target="_blank"
      rel="noreferrer"
      aria-label={ariaLabel}
      className={[
        "group relative inline-flex w-full items-center justify-center gap-2",
        "rounded-2xl px-5 py-3 text-sm font-semibold text-white",
        "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600",
        "shadow-lg shadow-violet-500/20 ring-1 ring-white/20",
        "transition-transform duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-500/25",
        "active:translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        buttonClassName,
      ].join(" ")}
    >
      {/* subtle glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[18px] bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-sky-500/25 blur-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />

      <span className="relative flex flex-col items-center leading-tight">
        <span>{label}</span>
        {subLabel ? (
          <span className="mt-0.5 text-[11px] font-normal text-white/85">
            {subLabel}
          </span>
        ) : null}
      </span>

      {/* arrow */}
      <span
        aria-hidden
        className="relative translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </a>
  );
}
