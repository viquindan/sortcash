export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-surface rounded w-48" />
      <div className="h-10 bg-surface rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 bg-surface rounded-lg border border-border" />
        ))}
      </div>
    </div>
  );
}
