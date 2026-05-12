import { sql } from "@/lib/db";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const stats = await sql<{ total: number; images: number; videos: number; folders: string[] }[]>`
    select
      count(*)::int as total,
      count(*) filter (where type = 'image')::int as images,
      count(*) filter (where type = 'video')::int as videos,
      array_agg(distinct folder) as folders
    from media
  `;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="px-8 py-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
            <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Marketing</span>
          </div>
          <h1 className="font-display text-[22px] font-bold text-brand-950">Bibliothèque de médias</h1>
        </div>
      </header>
      <div className="px-8 py-6">
        <MediaLibrary stats={stats[0] ?? { total: 0, images: 0, videos: 0, folders: [] }} />
      </div>
    </>
  );
}
