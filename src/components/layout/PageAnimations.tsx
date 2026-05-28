"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function PageAnimations() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [covering, setCovering] = useState(false);

  // Intercepte les clics — overlay uniquement si la PATHNAME change (pas juste les params)
  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const a = (e.target as Element).closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel") || href.startsWith("#")) return;

      try {
        const targetPathname = new URL(href, window.location.origin).pathname;
        // Si même pathname (ex: /catalogue?categorie=X → /catalogue?categorie=Y), pas d'overlay
        if (targetPathname === pathname) return;
      } catch {
        return;
      }

      setCovering(true);
    }
    document.addEventListener("click", onLinkClick);
    return () => document.removeEventListener("click", onLinkClick);
  }, [pathname]);

  // Retire l'overlay + scroll en haut quand la pathname change
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      setCovering(false);
    }
  }, [pathname]);

  // Sécurité : ferme l'overlay après 5s maximum quoi qu'il arrive
  useEffect(() => {
    if (!covering) return;
    const t = setTimeout(() => setCovering(false), 5000);
    return () => clearTimeout(t);
  }, [covering]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    const revealEls = document.querySelectorAll(".reveal-on-scroll");
    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (!covering) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#faf8f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid #f0e8d8", borderTopColor: "#d97706", animation: "spin-nav 0.7s linear infinite" }} />
      <style>{`@keyframes spin-nav { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
