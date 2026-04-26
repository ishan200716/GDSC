import React from 'react';
import { cn } from '../../lib/utils';
import { inter } from '../../lib/fonts';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none transition-shadow",
          "focus:shadow-[0_0_0_2px_#00D4C8] border border-white/10",
          inter.className,
          className
        )}
        style={{
          background: 'rgba(255,255,255,0.06)',
        }}
        {...props}
      />
    );
  }
);

GlassInput.displayName = 'GlassInput';
