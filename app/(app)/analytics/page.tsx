'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Users,
  Clock,
} from 'lucide-react';
import { cn, toDate } from '../../../lib/utils';
import { spaceGrotesk } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { StatCard } from '../../../components/ui/StatCard';
import { SkeletonStatCard, SkeletonChartCard } from '../../../components/ui/SkeletonCard';
import { getNeeds, getMatches } from '../../../lib/firebase';
import { CommunityNeed, VolunteerMatch, NeedCategory } from '../../../types';

// ── category colours (from DESIGN.md) ──
const CATEGORY_COLORS: Record<string, string> = {
  [NeedCategory.MEDICAL]: '#00D4C8',
  [NeedCategory.FOOD]: '#d2bbff',
  [NeedCategory.EDUCATION]: '#fbbf24',
  [NeedCategory.HOUSING]: '#FF6B35',
  [NeedCategory.SAFETY]: '#ef4444',
  [NeedCategory.OTHER]: '#9ca3af',
};

// ── date range options ──
type DateRange = 7 | 30 | 90;
const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];


function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ══════════════════════════════════════════════════════════
// Animated count-up number
// ══════════════════════════════════════════════════════════
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 1200;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {display.toLocaleString()}{suffix}
    </motion.span>
  );
}

// ══════════════════════════════════════════════════════════
// Custom donut label
// ══════════════════════════════════════════════════════════
function renderCustomizedLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // hide tiny slices

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ══════════════════════════════════════════════════════════
// Custom area chart tooltip
// ══════════════════════════════════════════════════════════
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1b1f2c] px-4 py-3 shadow-xl text-sm">
      <p className={cn('font-semibold text-white mb-1', spaceGrotesk.className)}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-400 capitalize">{p.dataKey}:</span>
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const [allNeeds, setAllNeeds] = useState<CommunityNeed[]>([]);
  const [allMatches, setAllMatches] = useState<VolunteerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>(30);

  // ── fetch ──
  useEffect(() => {
    (async () => {
      try {
        const [needs, matches] = await Promise.all([getNeeds(), getMatches()]);
        setAllNeeds(needs);
        setAllMatches(matches);
      } catch (err) {
        console.error('Analytics fetch error:', err);
        toast.error('Failed to load analytics data — check your connection', {
          style: { background: '#1b1f2c', color: '#fff', border: '1px solid rgba(255,107,53,0.4)' },
          iconTheme: { primary: '#FF6B35', secondary: '#0f131f' },
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── filtered by date range ──
  const cutoff = useMemo(() => daysAgo(range), [range]);

  const needs = useMemo(
    () => allNeeds.filter(n => toDate(n.createdAt) >= cutoff),
    [allNeeds, cutoff]
  );

  const matches = useMemo(
    () => allMatches.filter(m => toDate(m.createdAt) >= cutoff),
    [allMatches, cutoff]
  );

  // ── compute KPIs ──
  const totalNeeds = needs.length;

  const criticalActive = useMemo(
    () => needs.filter(n => n.urgencyScore >= 8 && n.status === 'open').length,
    [needs]
  );

  const volunteersDeployed = useMemo(
    () => new Set(matches.map(m => m.volunteerId)).size,
    [matches]
  );

  const avgResponseTimeHours = useMemo(() => {
    const resolved = needs.filter(n =>
      n.status === 'resolved' && n.resolvedAt
    );
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((sum, n) => {
      const diff = toDate(n.resolvedAt).getTime() - toDate(n.createdAt).getTime();
      return sum + diff / (1000 * 60 * 60);
    }, 0);
    return Math.round((totalHours / resolved.length) * 10) / 10;
  }, [needs]);

  // ── pie data ──
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    needs.forEach(n => {
      const cat = n.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [needs]);

  // ── area trend data ──
  const trendData = useMemo(() => {
    const buckets: Record<string, { critical: number; resolved: number }> = {};

    // pre-fill all days
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      buckets[key] = { critical: 0, resolved: 0 };
    }

    needs.forEach(n => {
      const key = dayKey(toDate(n.createdAt));
      if (!buckets[key]) return;
      if (n.urgencyScore >= 8) buckets[key].critical++;
      if (n.status === 'resolved') buckets[key].resolved++;
    });

    return Object.entries(buckets).map(([date, vals]) => ({
      date: date.slice(5), // "MM-DD"
      ...vals,
    }));
  }, [needs, range]);

  // ══════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 rounded animate-shimmer" />
          <div className="h-9 w-64 rounded-full animate-shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChartCard />
          <SkeletonChartCard />
        </div>
      </div>
    );
  }

  return (
    <>
    <Toaster position="top-right" />
    <div className="flex flex-col gap-6">
      {/* ── Header row with date range selector ── */}
      <div className="flex items-center justify-between">
        <h2 className={cn('text-2xl font-bold', spaceGrotesk.className)}>System Analytics</h2>

        <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10">
          {DATE_RANGES.map(dr => (
            <button
              key={dr.value}
              onClick={() => setRange(dr.value)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                range === dr.value
                  ? 'bg-[#00D4C8] text-[#0f131f] shadow-[0_0_12px_rgba(0,212,200,0.3)]'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top row — 4 KPI cards ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={range}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            label="Total Needs"
            value={<AnimatedNumber value={totalNeeds} />}
            change={12}
            accentColor="#00D4C8"
            sparkline={
              <div className="flex items-center gap-0.5 h-full">
                <Activity className="w-4 h-4 text-[#00D4C8] opacity-50" />
              </div>
            }
          />
          <StatCard
            label="Critical Active"
            value={<AnimatedNumber value={criticalActive} />}
            change={-4}
            accentColor="#FF6B35"
            sparkline={
              <div className="flex items-center gap-0.5 h-full">
                <AlertTriangle className="w-4 h-4 text-[#FF6B35] opacity-50" />
              </div>
            }
          />
          <StatCard
            label="Volunteers Deployed"
            value={<AnimatedNumber value={volunteersDeployed} />}
            change={8}
            accentColor="#d2bbff"
            sparkline={
              <div className="flex items-center gap-0.5 h-full">
                <Users className="w-4 h-4 text-[#d2bbff] opacity-50" />
              </div>
            }
          />
          <StatCard
            label="Avg Response Time"
            value={<AnimatedNumber value={avgResponseTimeHours} suffix="h" />}
            change={-15}
            accentColor="#fbbf24"
            sparkline={
              <div className="flex items-center gap-0.5 h-full">
                <Clock className="w-4 h-4 text-[#fbbf24] opacity-50" />
              </div>
            }
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Bottom row — charts ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`charts-${range}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* ─── Donut ─── */}
          <GlassCard className="p-6">
            <h3 className={cn('font-bold text-lg mb-6', spaceGrotesk.className)}>Needs by Category</h3>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#9ca3af'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* custom legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 justify-center">
              {pieData.map(entry => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#9ca3af' }}
                  />
                  <span className="capitalize">{entry.name}</span>
                  <span className="text-gray-500">({entry.value})</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* ─── Area chart ─── */}
          <GlassCard className="p-6">
            <h3 className={cn('font-bold text-lg mb-6', spaceGrotesk.className)}>
              Urgency vs Resolution Trend
            </h3>

            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4C8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4C8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="critical"
                    stroke="#FF6B35"
                    strokeWidth={2}
                    fill="url(#criticalGrad)"
                    fillOpacity={0.3}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#FF6B35' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#00D4C8"
                    strokeWidth={2}
                    fill="url(#resolvedGrad)"
                    fillOpacity={0.3}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#00D4C8' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#9ca3af' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
    </>
  );
}
