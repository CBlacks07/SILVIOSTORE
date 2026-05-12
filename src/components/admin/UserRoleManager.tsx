"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function UserRoleManager({ userId, role }: { userId: string; role: "customer" | "admin" }) {
  const router = useRouter();
  const [value, setValue] = useState<"customer" | "admin">(role);
  const [busy, setBusy] = useState(false);

  async function update(next: "customer" | "admin") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users/" + userId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next })
      });
      if (res.ok) {
        setValue(next);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="input max-w-[160px]"
        value={value}
        disabled={busy}
        onChange={(e) => update(e.target.value as "customer" | "admin")}
      >
        <option value="customer">Client</option>
        <option value="admin">Administrateur</option>
      </select>
      {busy && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
    </div>
  );
}
