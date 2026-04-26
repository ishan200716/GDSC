import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
}

export function GlassCard({ className, children, glowColor = 'rgba(0,212,200,0.2)', style, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border",
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        borderColor: glowColor,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
