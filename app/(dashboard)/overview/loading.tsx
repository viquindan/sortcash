export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-surface rounded w-40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-surface rounded-xl border border-border" />
        ))}
      </div>
      <div className="h-72 bg-surface rounded-xl border border-border" />
      <div className="h-48 bg-surface rounded-xl border border-border" />
    </div>
  );
}
