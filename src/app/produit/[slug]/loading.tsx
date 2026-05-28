export default function ProductLoading() {
  return (
    <div className="container-page py-6 md:py-10 pb-32 lg:pb-12">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-3 w-14 rounded bg-brand-100 animate-pulse" />
        <div className="h-3 w-2 rounded bg-brand-100 animate-pulse" />
        <div className="h-3 w-20 rounded bg-brand-100 animate-pulse" />
        <div className="h-3 w-2 rounded bg-brand-100 animate-pulse" />
        <div className="h-3 w-32 rounded bg-brand-100 animate-pulse" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Galerie */}
        <div className="space-y-4 w-full max-w-[500px] mx-auto lg:mx-0">
          <div className="aspect-square w-full rounded-3xl bg-brand-100 animate-pulse" />
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 w-20 shrink-0 rounded-xl bg-brand-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Infos produit */}
        <div className="space-y-5">
          <div className="h-3 w-20 rounded bg-brand-100 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-full rounded bg-brand-100 animate-pulse" />
            <div className="h-8 w-3/4 rounded bg-brand-100 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-full bg-brand-100 animate-pulse" />
          <div className="h-14 w-32 rounded bg-brand-100 animate-pulse" />
          <div className="h-4 w-24 rounded bg-brand-100 animate-pulse" />
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full rounded bg-brand-50 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-brand-50 animate-pulse" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-14 flex-1 rounded-2xl bg-brand-100 animate-pulse" />
            <div className="h-14 w-14 rounded-2xl bg-brand-100 animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-brand-50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
