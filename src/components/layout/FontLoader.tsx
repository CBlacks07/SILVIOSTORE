"use client";
import { useEffect } from "react";

export function FontLoader({ href }: { href: string }) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [href]);
  return null;
}
