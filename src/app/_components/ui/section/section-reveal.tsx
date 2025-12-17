"use client";

import * as React from "react";
import styles from "./section-reveal.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number; // default matches SectionHeader pop
};

export function SectionReveal({ children, className = "", delayMs = 100 }: Props) {
  return (
    <div
      className={`${styles.bodyReveal} ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
