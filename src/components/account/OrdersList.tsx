"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { RetryPaymentButton } from "@/components/order/RetryPaymentButton";

type Order = {
  id: string;
  reference: string;
  status: string;
  total: number;
  created_at: string;
  is_hidden: boolean;
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "En attente",      color: "#92400e", bg: "rgba(217,119,6,0.12)" },
  paid:      { label: "Payée",           color: "#1d4ed8", bg: "rgba(29,78,216,0.10)" },
  preparing: { label: "En préparation",  color: "#1d4ed8", bg: "rgba(29,78,216,0.10)" },
  shipped:   { label: "Expédiée",        color: "#4338ca", bg: "rgba(67,56,202,0.10)" },
  delivered: { label: "Livrée",          color: "#166534", bg: "rgba(22,101,52,0.10)" },
  cancelled: { label: "Annulée",         color: "#991b1b", bg: "rgba(153,27,27,0.10)" },
};

const HIDEABLE = ["cancelled", "paid", "delivered"];

export function OrdersList({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [showHidden, setShowHidden] = useState(false);

  async function toggleHide(id: string) {
    const res = await fetch(`/api/account/orders/${id}/hide`, { method: "PATCH" });
    const data = await res.json();
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, is_hidden: data.is_hidden } : o));
    }
  }

  const visible = orders.filter((o) => showHidden || !o.is_hidden);
  const hiddenCount = orders.filter((o) => o.is_hidden).length;

  if (orders.length === 0) {
    return <p className="text-sm text-brand-600">Vous n&apos;avez encore passé aucune commande.</p>;
  }

  return (
    <div>
      {/* Toggle afficher masquées */}
      {hiddenCount > 0 && (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setShowHidden(!showHidden)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}
          >
            {showHidden ? <EyeOff size={14} /> : <Eye size={14} />}
            {showHidden ? "Masquer les archivées" : `Afficher les archivées (${hiddenCount})`}
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f3f4f6", textAlign: "left" }}>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600, fontSize: "12px" }}>Référence</th>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600, fontSize: "12px" }}>Date</th>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600, fontSize: "12px" }}>Statut</th>
              <th style={{ padding: "10px 8px", color: "#9ca3af", fontWeight: 600, fontSize: "12px", textAlign: "right" }}>Total</th>
              <th style={{ padding: "10px 8px" }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const s = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
              const canHide = HIDEABLE.includes(o.status);
              return (
                <tr key={o.id} style={{ borderBottom: "1px solid #f9fafb", opacity: o.is_hidden ? 0.5 : 1, transition: "opacity 0.2s" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 600, color: "#1a1008", fontFamily: "monospace", fontSize: "13px" }}>{o.reference}</td>
                  <td style={{ padding: "12px 8px", color: "#6b7280" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700, color: "#1a1008" }}>{formatPrice(o.total)}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                      {o.status === "pending" && <RetryPaymentButton reference={o.reference} compact />}
                      <Link href={"/commande/" + o.reference} style={{ fontSize: "13px", fontWeight: 600, color: "#d97706", textDecoration: "none" }}>
                        Détails
                      </Link>
                      {canHide && (
                        <button
                          type="button"
                          onClick={() => toggleHide(o.id)}
                          title={o.is_hidden ? "Rendre visible" : "Masquer cette commande"}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 0 }}
                        >
                          {o.is_hidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p style={{ textAlign: "center", padding: "24px", fontSize: "13px", color: "#9ca3af" }}>
          Toutes vos commandes sont archivées.
        </p>
      )}
    </div>
  );
}
