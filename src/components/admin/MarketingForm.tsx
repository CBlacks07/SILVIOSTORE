"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, ToggleLeft, ToggleRight } from "lucide-react";
import type { MarketingSettings } from "@/lib/types";

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-brand-800">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className="text-brand-400 hover:text-accent transition-colors">
        {value
          ? <ToggleRight className="h-7 w-7 text-accent" />
          : <ToggleLeft className="h-7 w-7" />}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wide text-brand-500">{label}</label>
      {children}
    </div>
  );
}

export function MarketingForm({ initial }: { initial: MarketingSettings }) {
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/settings/marketing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMsg({ ok: true, text: "Enregistré." });
      router.refresh();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  const wp = v.welcome_popup;
  const sp = v.social_proof;
  const su = v.stock_urgency;
  const ei = v.exit_intent;
  const cr = v.cart_reminder;

  return (
    <div className="space-y-6">

      {/* Welcome Popup */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-brand-950">Popup de bienvenue</h3>
          <Toggle label="" value={wp.enabled} onChange={(b) => setV({ ...v, welcome_popup: { ...wp, enabled: b } })} />
        </div>
        {wp.enabled && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titre">
              <input className="input" value={wp.title} onChange={(e) => setV({ ...v, welcome_popup: { ...wp, title: e.target.value } })} />
            </Field>
            <Field label="Code promo">
              <input className="input font-mono uppercase" value={wp.promo_code} onChange={(e) => setV({ ...v, welcome_popup: { ...wp, promo_code: e.target.value.toUpperCase() } })} />
            </Field>
            <Field label="Description (col. entière)">
              <textarea className="input resize-none" rows={2} value={wp.description} onChange={(e) => setV({ ...v, welcome_popup: { ...wp, description: e.target.value } })} />
            </Field>
            <Field label="Délai d'apparition (secondes)">
              <input type="number" min={1} max={30} className="input" value={wp.delay_seconds} onChange={(e) => setV({ ...v, welcome_popup: { ...wp, delay_seconds: Number(e.target.value) } })} />
            </Field>
          </div>
        )}
      </div>

      {/* Social Proof */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand-950">Social proof en temps réel</h3>
            <p className="text-xs text-brand-500 mt-0.5">Notifications des derniers achats</p>
          </div>
          <Toggle label="" value={sp.enabled} onChange={(b) => setV({ ...v, social_proof: { ...sp, enabled: b } })} />
        </div>
        {sp.enabled && (
          <Field label="Intervalle entre notifications (secondes)">
            <input type="number" min={5} max={120} className="input w-32" value={sp.interval_seconds} onChange={(e) => setV({ ...v, social_proof: { ...sp, interval_seconds: Number(e.target.value) } })} />
          </Field>
        )}
      </div>

      {/* Stock Urgency */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand-950">Urgence stock</h3>
            <p className="text-xs text-brand-500 mt-0.5">Bandeau sur la page produit</p>
          </div>
          <Toggle label="" value={su.enabled} onChange={(b) => setV({ ...v, stock_urgency: { ...su, enabled: b } })} />
        </div>
        {su.enabled && (
          <Field label="Seuil d'alerte (afficher si stock ≤)">
            <input type="number" min={1} max={20} className="input w-32" value={su.threshold} onChange={(e) => setV({ ...v, stock_urgency: { ...su, threshold: Number(e.target.value) } })} />
          </Field>
        )}
      </div>

      {/* Exit Intent */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand-950">Exit intent</h3>
            <p className="text-xs text-brand-500 mt-0.5">Popup quand le visiteur quitte la page</p>
          </div>
          <Toggle label="" value={ei.enabled} onChange={(b) => setV({ ...v, exit_intent: { ...ei, enabled: b } })} />
        </div>
        {ei.enabled && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Titre">
              <input className="input" value={ei.title} onChange={(e) => setV({ ...v, exit_intent: { ...ei, title: e.target.value } })} />
            </Field>
            <Field label="Délai avant activation (secondes)">
              <input type="number" min={5} max={60} className="input" value={ei.arm_delay_seconds} onChange={(e) => setV({ ...v, exit_intent: { ...ei, arm_delay_seconds: Number(e.target.value) } })} />
            </Field>
            <Field label="Description (col. entière)">
              <textarea className="input resize-none" rows={2} value={ei.description} onChange={(e) => setV({ ...v, exit_intent: { ...ei, description: e.target.value } })} />
            </Field>
          </div>
        )}
      </div>

      {/* Cart Reminder */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-brand-950">Rappel panier abandonné</h3>
            <p className="text-xs text-brand-500 mt-0.5">Popup pour les visiteurs avec un panier non finalisé</p>
          </div>
          <Toggle label="" value={cr.enabled} onChange={(b) => setV({ ...v, cart_reminder: { ...cr, enabled: b } })} />
        </div>
        {cr.enabled && (
          <Field label="Délai d'apparition (secondes)">
            <input type="number" min={1} max={30} className="input w-32" value={cr.delay_seconds} onChange={(e) => setV({ ...v, cart_reminder: { ...cr, delay_seconds: Number(e.target.value) } })} />
          </Field>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" />Enregistrer</>}
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
