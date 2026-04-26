import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 p-5',
        className
      )}
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      {/* header row */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full animate-shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded animate-shimmer" />
          <div className="h-3 w-1/3 rounded animate-shimmer" />
        </div>
      </div>

      {/* body lines */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded animate-shimmer" />
        <div className="h-3 w-5/6 rounded animate-shimmer" />
      </div>

      {/* footer row */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-3 w-20 rounded animate-shimmer" />
          <div className="h-3 w-16 rounded animate-shimmer" />
        </div>
        <div className="h-8 w-24 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonMapCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-white/10 overflow-hidden', className)}
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="w-full h-full min-h-[400px] animate-shimmer" />
    </div>
  );
}

export function SkeletonChartCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-white/10 p-6', className)}
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="h-5 w-40 rounded animate-shimmer mb-6" />
      <div className="h-[280px] w-full rounded-xl animate-shimmer" />
      <div className="flex justify-center gap-4 mt-4">
        <div className="h-3 w-16 rounded animate-shimmer" />
        <div className="h-3 w-16 rounded animate-shimmer" />
        <div className="h-3 w-16 rounded animate-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-white/10 p-6', className)}
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="h-1 w-1/2 rounded animate-shimmer mb-4" />
      <div className="h-3 w-24 rounded animate-shimmer mb-3" />
      <div className="h-8 w-20 rounded animate-shimmer" />
    </div>
  );
}
