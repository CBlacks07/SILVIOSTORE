"use client";

import { useState } from "react";
import { MapPin, Clock, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const COUNTRIES: { name: string; eta: string; cost: number }[] = [
  { name: "Togo",           eta: "1 – 2 jours ouvrés",  cost: 1500 },
  { name: "Bénin",          eta: "3 – 5 jours ouvrés",  cost: 5000 },
  { name: "Ghana",          eta: "3 – 5 jours ouvrés",  cost: 5000 },
  { name: "Burkina Faso",   eta: "3 – 5 jours ouvrés",  cost: 5000 },
  { name: "Côte d'Ivoire",  eta: "5 – 8 jours ouvrés",  cost: 8000 },
  { name: "Niger",          eta: "5 – 8 jours ouvrés",  cost: 8000 },
  { name: "Sénégal",        eta: "5 – 8 jours ouvrés",  cost: 8000 },
  { name: "Mali",           eta: "5 – 8 jours ouvrés",  cost: 8000 },
  { name: "Guinée",         eta: "5 – 8 jours ouvrés",  cost: 8000 },
  { name: "Nigeria",        eta: "5 – 8 jours ouvrés",  cost: 8000 },
];

export function DeliveryEstimator() {
  const [selected, setSelected] = useState<string>("");
  const result = COUNTRIES.find((c) => c.name === selected);

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6 mb-10">
      <p className="text-xs font-black uppercase tracking-widest text-accent mb-1">Estimateur</p>
      <h3 className="font-display text-lg font-bold text-brand-950 mb-4">Quel est mon délai de livraison ?</h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
          <select
            className="input pl-9 appearance-none"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">— Sélectionnez votre pays —</option>
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white border border-brand-100 px-4 py-3">
            <Clock className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-400">Délai estimé</p>
              <p className="text-sm font-bold text-brand-950">{result.eta}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white border border-brand-100 px-4 py-3">
            <CreditCard className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-400">Frais de livraison</p>
              <p className="text-sm font-bold text-accent">{formatPrice(result.cost)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
