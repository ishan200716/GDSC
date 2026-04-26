import React from 'react';
import { cn } from '../../lib/utils';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface UrgencyBadgeProps {
  level: UrgencyLevel;
  className?: string;
}

const levelConfig: Record<UrgencyLevel, { bg: string; text: string; animate: boolean }> = {
  CRITICAL: { bg: '#FF6B35', text: '#FFFFFF', animate: true },
  HIGH: { bg: '#fbbf24', text: '#000000', animate: false },
  MEDIUM: { bg: '#2dd4bf', text: '#000000', animate: false },
  LOW: { bg: '#9ca3af', text: '#000000', animate: false },
};

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  const config = levelConfig[level];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
        config.animate && "animate-pulse",
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text
      }}
    >
      {level}
    </span>
  );
}
