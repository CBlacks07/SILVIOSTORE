import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; style: React.CSSProperties }> = {
  pending:   { label: "En attente",  style: { background: "#fef3c7", color: "#92400e" } },
  approved:  { label: "Approuvée",   style: { background: "#d1fae5", color: "#065f46" } },
  rejected:  { label: "Refusée",     style: { background: "#fee2e2", color: "#991b1b" } },
  processed: { label: "Traitée",     style: { background: "#ede9fe", color: "#4c1d95" } }
};

export default async function AdminRetoursPage() {
  let returns: {
    id: string;
    order_reference: string;
    email: string;
    reason: string;
    description: string | null;
    status: string;
    created_at: string;
  }[] = [];

  try {
    returns = await sql<typeof returns[0][]>`
      SELECT id, order_reference, email, reason, description, status, created_at
      FROM return_requests
      ORDER BY created_at DESC
    `;
  } catch {
    // table may not exist yet
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
              <span>Admin</span><span>›</span><span>Ventes</span><span>›</span>
              <span className="text-brand-700 font-medium">Retours</span>
            </div>
            <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">
              Demandes de retour
            </h1>
          </div>
          <span className="text-sm text-brand-500">{returns.length} demande{returns.length !== 1 ? "s" : ""}</span>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6">
        {returns.length === 0 ? (
          <div className="card p-10 text-center text-sm text-brand-500">
            Aucune demande de retour pour l&apos;instant.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-500 border-b border-brand-100 bg-brand-50/60">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Référence</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Motif</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((r) => {
                    const meta = STATUS_META[r.status] || STATUS_META.pending;
                    return (
                      <tr key={r.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/40">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-950">{r.order_reference}</td>
                        <td className="px-4 py-3 text-brand-700">{r.email}</td>
                        <td className="px-4 py-3 text-brand-700">
                          <div>{r.reason}</div>
                          {r.description && (
                            <div className="text-xs text-brand-400 mt-0.5 truncate max-w-xs">{r.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span style={{ ...meta.style, padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-500">
                          {new Date(r.created_at).toLocaleString("fr-FR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {returns.map((r) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending;
                return (
                  <div key={r.id} className="card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-brand-950">{r.order_reference}</span>
                      <span style={{ ...meta.style, padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: 600 }}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-brand-700">{r.email}</p>
                    <p className="text-sm text-brand-900 font-medium">{r.reason}</p>
                    {r.description && <p className="text-xs text-brand-500">{r.description}</p>}
                    <p className="text-xs text-brand-400">{new Date(r.created_at).toLocaleString("fr-FR")}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
