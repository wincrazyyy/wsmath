"use client";

import Image from "next/image";

type Props = {
  name: string;
  src?: string;
  useDefaultAvatar?: boolean;
  size?: number; // px, e.g. 40, 48
  className?: string;
};

export function TestimonialAvatar({
  name,
  src,
  useDefaultAvatar,
  size = 40,
  className = "",
}: Props) {
  const showImage = !!src && !useDefaultAvatar;

  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-full ring-1 ring-neutral-200 bg-neutral-100",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
      aria-label={`${name} avatar`}
      title={name}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={`${name} avatar`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <PersonIcon
          className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-500"
          size={Math.round(size * 0.5)}
        />
      )}
    </div>
  );
}

function PersonIcon({
  className,
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 20a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
