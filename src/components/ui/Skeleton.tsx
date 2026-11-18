import React from 'react';
import { cn } from '@/utils/format';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200/80', className)}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden p-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-5 w-1/2" />
      </div>
    </div>
  );
}
