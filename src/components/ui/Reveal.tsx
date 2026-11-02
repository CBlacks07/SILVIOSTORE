"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section";
};

export function Reveal({ children, delay = 0, y = 20, className, as = "div" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) { setVisible(true); return; }
    const ob = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); ob.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, [reduced]);

  const Tag = as as any;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: reduced ? "none" : `opacity 0.55s ease ${delay}s, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
        willChange: visible ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
