"use client";

type EmailRow = { id: string; email: string; source: string; created_at: string };

export function NewsletterExportButton({ emails }: { emails: EmailRow[] }) {
  function exportCSV() {
    const rows = [
      ["email", "source", "date"],
      ...emails.map((e) => [e.email, e.source, new Date(e.created_at).toLocaleString("fr-FR")])
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCSV}
      style={{ background: "#1a1008", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
    >
      Exporter CSV
    </button>
  );
}
