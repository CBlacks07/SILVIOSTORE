export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-brand-100 border-t-accent animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Chargement…</span>
      </div>
    </div>
  );
}
