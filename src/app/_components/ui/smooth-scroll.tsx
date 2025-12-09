"use client";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.scrollBehavior;
    el.style.scrollBehavior = "smooth";
    return () => {
      el.style.scrollBehavior = prev;
    };
  }, []);

    // no UI
  return null;
}
