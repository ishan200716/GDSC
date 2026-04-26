'use client';

import { cn } from '../lib/utils';
import { spaceGrotesk } from '../lib/fonts';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0A0E1A] flex flex-col items-center justify-center z-[100]">
      {/* pulsing logo */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4C8] to-[#7C3AED] flex items-center justify-center shadow-[0_0_40px_rgba(0,212,200,0.4)] animate-pulse">
          <span className="text-white font-bold text-2xl">C</span>
        </div>
        {/* outer glow ring */}
        <div className="absolute inset-0 -m-3 rounded-3xl border-2 border-[#00D4C8]/20 animate-ping" />
      </div>

      <h1 className={cn('text-xl font-bold text-white mb-2', spaceGrotesk.className)}>
        Community<span className="text-[#00D4C8]">Pulse</span>
      </h1>

      <p className="text-gray-500 text-sm">Initializing mission control…</p>

      {/* loading bar */}
      <div className="mt-6 w-48 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00D4C8] to-[#7C3AED]"
          style={{
            animation: 'loadingBar 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
