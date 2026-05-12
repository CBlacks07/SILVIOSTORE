"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";

const AUTH_EVENT_KEY = "silvio-auth:event";

export function AuthSync() {
  const router = useRouter();
  const setOwner = useCart((s) => s.setOwner);

  useEffect(() => {
    let alive = true;

    async function syncSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok || !alive) return;
        const data = await res.json();
        setOwner(data?.userId || "guest");
      } catch {}
    }

    syncSession();

    function onStorage(e: StorageEvent) {
      if (e.key !== AUTH_EVENT_KEY) return;
      syncSession();
      router.refresh();
    }

    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [router, setOwner]);

  return null;
}

