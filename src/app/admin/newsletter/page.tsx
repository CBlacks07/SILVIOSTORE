import { sql } from "@/lib/db";
import { NewsletterExportButton } from "./NewsletterExportButton";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  let emails: { id: string; email: string; source: string; created_at: string }[] = [];
  try {
    emails = await sql<{ id: string; email: string; source: string; created_at: string }[]>`
      SELECT id, email, source, created_at
      FROM newsletter_emails
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
              <span>Admin</span><span>›</span><span>Marketing</span><span>›</span>
              <span className="text-brand-700 font-medium">Newsletter</span>
            </div>
            <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Newsletter</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-brand-500">{emails.length} inscrits</span>
            <NewsletterExportButton emails={emails} />
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6">
        {emails.length === 0 ? (
          <div className="card p-10 text-center text-sm text-brand-500">
            Aucun email inscrit pour l&apos;instant.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-brand-500 border-b border-brand-100 bg-brand-50/60">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Source</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {emails.map((e) => (
                  <tr key={e.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/40">
                    <td className="px-4 py-3 text-brand-950 font-medium">{e.email}</td>
                    <td className="px-4 py-3 text-brand-500 text-xs">{e.source}</td>
                    <td className="px-4 py-3 text-brand-500 text-xs">
                      {new Date(e.created_at).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
