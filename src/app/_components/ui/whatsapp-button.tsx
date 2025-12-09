// app/_components/whatsapp-button.tsx
import Image from "next/image";
import miscContent from "@/app/_lib/content/json/misc.json";

type WhatsAppButtonProps = {
  width?: number;
  height?: number;
  /** Extra classes for the outer anchor */
  buttonClassName?: string;
  /** Extra classes for the inner <Image> (e.g. h-14 w-auto) */
  imgClassName?: string;
  ariaLabel?: string;
  priority?: boolean;
  /** Optional override – if omitted, uses misc.json WhatsApp settings */
  href?: string;
};

const { whatsapp } = miscContent;

export function WhatsAppButton({
  width = 160,
  height = 44,
  buttonClassName = "",
  imgClassName = "h-10 w-auto",
  ariaLabel = "Chat on WhatsApp",
  priority = true,
  href,
}: WhatsAppButtonProps) {
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
      className={`inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-violet-400/40 ${buttonClassName}`}
    >
      <Image
        src="/whatsapp-button.png"
        alt={ariaLabel}
        width={width}
        height={height}
        className={`select-none transition-opacity hover:opacity-90 ${imgClassName}`}
        priority={priority}
      />
    </a>
  );
}
