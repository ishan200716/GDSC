'use client';
 
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useNeeds } from '../../../hooks/useNeeds';
import { NeedCard } from '../../../components/dashboard/NeedCard';
import { NeedsMap } from '../../../components/dashboard/NeedsMap';
import { generateInsight } from '../../../lib/gemini';
import { Sparkles, RefreshCw, Map, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { spaceGrotesk, inter } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { SkeletonCard, SkeletonMapCard } from '../../../components/ui/SkeletonCard';
 
export default function DashboardPage() {
  const { needs, loading } = useNeeds();
  const [insight, setInsight] = useState<string>('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
 
  const fetchInsight = useCallback(async () => {
    if (needs.length === 0) return;
    setInsightLoading(true);
    const newInsight = await generateInsight(needs);
    setInsight(newInsight);
    setInsightLoading(false);
  }, [needs]);
 
  useEffect(() => {
    if (needs.length > 0 && !insight) {
      fetchInsight();
    }
  }, [needs, insight, fetchInsight]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Left Needs Feed — full width on mobile */}
      <div className="w-full md:w-[45%] flex flex-col h-full gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className={cn("text-lg md:text-xl font-bold", spaceGrotesk.className)}>Live Network Feed</h2>
          <span className="text-xs bg-[#00D4C8]/10 text-[#00D4C8] px-2 py-1 rounded-full border border-[#00D4C8]/20 flex items-center gap-1.5">
             <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4C8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00D4C8]"></span>
            </span>
            {loading ? '—' : needs.length} Updates
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 md:pr-2 flex flex-col gap-3 md:gap-4 pb-10 scrollbar-hide">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : (
            <AnimatePresence>
              {needs.map((need, index) => (
                <motion.div
                  key={need.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <NeedCard need={need} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right Panel — hidden on mobile */}
      <div className="hidden md:flex flex-1 flex-col gap-6 h-full">
        {/* Map Top */}
        <div className="flex-1 min-h-[400px]">
          <Suspense fallback={<SkeletonMapCard className="h-full" />}>
            <NeedsMap needs={needs} />
          </Suspense>
        </div>

        {/* Insight Bottom */}
        <GlassCard className="p-6 border-l-4" style={{ borderLeftColor: '#7C3AED' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d2bbff]" />
              <h3 className={cn("font-bold text-[#d2bbff]", spaceGrotesk.className)}>AI Operations Insight</h3>
            </div>
            <button 
              onClick={fetchInsight}
              disabled={insightLoading}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", insightLoading && "animate-spin")} />
            </button>
          </div>
          
          <div className={cn("text-lg font-medium text-white/90 leading-relaxed", inter.className)}>
            {insightLoading ? (
              <span className="text-gray-500 animate-pulse">Analyzing network telemetry...</span>
            ) : insight ? (
              insight
            ) : (
              <span className="text-gray-500">Awaiting data to generate insights.</span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ─── Mobile: floating "View Map" button + bottom sheet ─── */}
      <div className="md:hidden">
        <Dialog.Root open={mapOpen} onOpenChange={setMapOpen}>
          <Dialog.Trigger asChild>
            <button className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-[#00D4C8] to-[#7C3AED] text-white rounded-full px-5 py-3 shadow-[0_0_20px_rgba(0,212,200,0.4)] flex items-center gap-2 text-sm font-semibold">
              <Map className="w-4 h-4" />
              View Map
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in" />
            <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0E1A] rounded-t-3xl border-t border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-300"
              style={{ height: '85vh' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h3 className={cn("font-bold text-lg", spaceGrotesk.className)}>Needs Map</h3>
                <Dialog.Close asChild>
                  <button className="p-2 rounded-full hover:bg-white/5 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
              <div className="h-[calc(85vh-64px)]">
                <NeedsMap needs={needs} />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* ─── Mobile: insight card below the feed ─── */}
      <div className="md:hidden">
        <GlassCard className="p-5 border-l-4" style={{ borderLeftColor: '#7C3AED' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d2bbff]" />
              <h3 className={cn("font-bold text-sm text-[#d2bbff]", spaceGrotesk.className)}>AI Insight</h3>
            </div>
            <button onClick={fetchInsight} disabled={insightLoading} className="text-gray-400">
              <RefreshCw className={cn("w-3.5 h-3.5", insightLoading && "animate-spin")} />
            </button>
          </div>
          <div className={cn("text-sm text-white/90 leading-relaxed", inter.className)}>
            {insightLoading ? (
              <span className="text-gray-500 animate-pulse">Analyzing…</span>
            ) : insight || (
              <span className="text-gray-500">Awaiting data.</span>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
