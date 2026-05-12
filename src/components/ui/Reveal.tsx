"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section";
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, delay = 0, y = 20, className, as = "div" }: Props) {
  const reduce = useReducedMotion();
  const Component = as === "section" ? motion.section : motion.div;

  if (reduce) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease, delay }}
    >
      {children}
    </Component>
  );
}
