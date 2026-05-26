export default function AdminLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-brand-100 border-t-accent animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Chargement…</span>
      </div>
    </div>
  );
}
