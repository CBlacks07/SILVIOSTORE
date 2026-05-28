"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur est survenue.");
        setStatus("error");
      } else {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      setErrorMsg("Impossible d'envoyer. Vérifiez votre connexion.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h3 className="font-display text-xl font-bold text-brand-950">Message envoyé !</h3>
        <p className="text-sm text-brand-600 max-w-xs">
          Nous avons bien reçu votre message et vous répondrons dans les 24h.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn-outline text-sm mt-2"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-500 mb-1.5">Nom complet</label>
          <input
            required
            className="input"
            placeholder="Votre nom"
            value={form.name}
            onChange={e => update("name", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-500 mb-1.5">E-mail</label>
          <input
            type="email"
            required
            className="input"
            placeholder="votre@email.com"
            value={form.email}
            onChange={e => update("email", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-brand-500 mb-1.5">Sujet</label>
        <input
          required
          className="input"
          placeholder="De quoi s'agit-il ?"
          value={form.subject}
          onChange={e => update("subject", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-brand-500 mb-1.5">Message</label>
        <textarea
          required
          rows={5}
          className="input resize-none"
          placeholder="Décrivez votre demande..."
          value={form.message}
          onChange={e => update("message", e.target.value)}
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <button type="submit" className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</>
          ) : "Envoyer le message"}
        </button>
        <p className="text-xs text-brand-500">Réponse sous 24h.</p>
      </div>
    </form>
  );
}
