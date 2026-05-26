export default function CatalogueLoading() {
  return (
    <div className="container-page py-8 md:py-10">
      {/* Banner placeholder */}
      <div className="mb-8 h-40 md:h-52 w-full rounded-2xl bg-brand-100 animate-pulse" />

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-60 shrink-0 space-y-5">
          {[120, 90, 100, 80].map((w, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 rounded bg-brand-100 animate-pulse" style={{ width: `${w}px` }} />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-3 rounded bg-brand-50 animate-pulse" style={{ width: `${60 + j * 12}px` }} />
              ))}
            </div>
          ))}
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar skeleton */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="h-4 w-32 rounded bg-brand-100 animate-pulse" />
            <div className="h-9 w-36 rounded-lg bg-brand-100 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-brand-100 bg-white">
                <div className="aspect-square bg-brand-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded bg-brand-100 animate-pulse w-3/4" />
                  <div className="h-3 rounded bg-brand-50 animate-pulse w-1/2" />
                  <div className="h-5 rounded bg-brand-100 animate-pulse w-2/3 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
