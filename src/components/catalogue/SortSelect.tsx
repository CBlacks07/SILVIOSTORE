"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    if (e.target.value && e.target.value !== "recent") {
      next.set("tri", e.target.value);
    } else {
      next.delete("tri");
    }
    const qs = next.toString();
    router.push(qs ? "/catalogue?" + qs : "/catalogue", { scroll: false });
  }

  return (
    <select name="tri" value={value} onChange={onChange} className="input max-w-xs">
      <option value="recent">Plus récents</option>
      <option value="prix-asc">Prix croissant</option>
      <option value="prix-desc">Prix décroissant</option>
      <option value="nom">Nom A-Z</option>
    </select>
  );
}
