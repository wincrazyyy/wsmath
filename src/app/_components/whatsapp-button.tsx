// app/_components/whatsapp-button.tsx
import Image from "next/image";

type WhatsAppButtonProps = {
  width?: number;
  height?: number;
  /** Extra classes for the outer anchor */
  buttonClassName?: string;
  /** Extra classes for the inner <Image> (e.g. h-14 w-auto) */
  imgClassName?: string;
  ariaLabel?: string;
  priority?: boolean;
  /** Override the target link if needed */
  href?: string;
};

export function WhatsAppButton({
  width = 160,
  height = 44,
  buttonClassName = "",
  imgClassName = "h-10 w-auto",
  ariaLabel = "Chat on WhatsApp",
  priority = true,
  href = "https://wa.me/85293199914?text=Hi%20Winson%20Siu,%20I'm%20interested%20in%20your%20Math%20tutoring%20service!",
}: WhatsAppButtonProps) {
  return (
    <a
      href={href}
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
