"use client";

import Link from "next/link";
import { Phone } from "lucide-react";

type Props = {
  enabled: boolean;
  text: string;
  phone: string;
};

export function HeaderTopBar({ enabled, text, phone }: Props) {
  if (!enabled) return null;

  return (
    <div className="bg-brand-900 text-white py-2 text-[10px] sm:text-[11px] font-semibold tracking-wider">
      <div className="container-page flex justify-center sm:justify-between items-center gap-4">
        <p className="truncate pr-0 sm:pr-4 text-center sm:text-left">{text}</p>
        <div className="hidden sm:flex items-center gap-6 shrink-0 opacity-90">
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 hover:text-accent transition-all duration-200"
          >
            <Phone className="h-3 w-3" />
            {phone}
          </a>
          <Link
            href="/contact"
            className="hover:text-accent transition-all duration-200"
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
