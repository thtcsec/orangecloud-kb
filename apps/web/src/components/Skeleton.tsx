export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-elevated ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
    </tr>
  );
}
