'use client';

import { useEffect } from 'react';
import { cn } from '../lib/utils';
import { spaceGrotesk, inter } from '../lib/fonts';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 bg-[#0A0E1A] flex items-center justify-center z-[100] p-4">
      {/* background decorative blur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FF6B35] rounded-full opacity-10 blur-[150px] pointer-events-none" />

      <GlassCard className="max-w-lg w-full p-10 text-center" glowColor="rgba(255,107,53,0.3)">
        <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7 text-[#FF6B35]" />
        </div>

        <h2 className={cn('text-2xl font-bold text-white mb-2', spaceGrotesk.className)}>
          System Anomaly Detected
        </h2>

        <p className={cn('text-gray-400 mb-2', inter.className)}>
          An unexpected error has interrupted operations. The engineering team has been notified.
        </p>

        {error?.message && (
          <div className="mt-4 mb-6 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Error details</p>
            <p className="text-sm text-[#FF6B35]/80 font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <GradientButton onClick={reset} className="w-full sm:w-auto">
            Retry Operation
          </GradientButton>
          <Link href="/dashboard">
            <GradientButton variant="ghost" className="w-full sm:w-auto flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </GradientButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
