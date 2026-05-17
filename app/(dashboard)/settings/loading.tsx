export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-surface rounded w-32" />
      <div className="h-48 bg-surface rounded-xl border border-border" />
      <div className="h-48 bg-surface rounded-xl border border-border" />
    </div>
  );
}
