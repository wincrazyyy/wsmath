// app/_components/floating-cta.tsx
"use client";
import { useEffect, useState } from "react";
import { WhatsAppButton } from "./whatsapp-button";

export function FloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* WhatsApp button */}
      <WhatsAppButton
        width={200}
        height={52}
        imgClassName="h-12 w-auto drop-shadow-lg"
        priority={false}
      />
    </div>
  );
}
