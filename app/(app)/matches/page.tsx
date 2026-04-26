'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  MapPin,
  Sparkles,
  CheckCircle2,
  Loader2,
  Rocket,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { spaceGrotesk, inter } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { CategoryChip } from '../../../components/ui/CategoryChip';
import { UrgencyBadge, UrgencyLevel } from '../../../components/ui/UrgencyBadge';
import {
  getVolunteerById,
  getVolunteers,
  getNeeds,
  createMatch,
  updateNeed,
} from '../../../lib/firebase';
import { getHybridMatches } from '../../../lib/matching';
import { Volunteer, CommunityNeed, VolunteerMatch, SkillType, DayOfWeek, NeedStatus } from '../../../types';

// ── skill colour map ──
const SKILL_COLORS: Record<SkillType, string> = {
  [SkillType.MEDICAL]: '#00D4C8',
  [SkillType.LOGISTICS]: '#d2bbff',
  [SkillType.EDUCATION]: '#fbbf24',
  [SkillType.CONSTRUCTION]: '#FF6B35',
  [SkillType.COUNSELLING]: '#a78bfa',
  [SkillType.FOOD_DISTRIBUTION]: '#34d399',
};

const DAY_SHORT: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'M',
  [DayOfWeek.TUESDAY]: 'T',
  [DayOfWeek.WEDNESDAY]: 'W',
  [DayOfWeek.THURSDAY]: 'T',
  [DayOfWeek.FRIDAY]: 'F',
  [DayOfWeek.SATURDAY]: 'S',
  [DayOfWeek.SUNDAY]: 'S',
};

const ALL_DAYS = Object.values(DayOfWeek);

// ── urgency helpers ──
function getUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 8) return 'CRITICAL';
  if (score >= 6) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

// ══════════════════════════════════════════════════════════
// Semicircular SVG Gauge
// ══════════════════════════════════════════════════════════
function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  // semicircle = π * r
  const semiCircumference = Math.PI * radius;
  const offset = semiCircumference - (score / 100) * semiCircumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + stroke} className="overflow-visible">
        {/* track */}
        <path
          d={`M ${stroke / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - stroke / 2},${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* arc */}
        <path
          d={`M ${stroke / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - stroke / 2},${size / 2}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={semiCircumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4C8" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className={cn('text-3xl font-bold text-white', spaceGrotesk.className)}>{score}</span>
        <span className={cn('text-[10px] uppercase tracking-widest text-gray-400 mt-0.5', inter.className)}>match score</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Confetti burst (CSS-only particles)
// ══════════════════════════════════════════════════════════
function ConfettiBurst() {
  const colors = ['#00D4C8', '#7C3AED', '#FF6B35', '#fbbf24', '#d2bbff', '#34d399'];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 360;
        const distance = 60 + Math.random() * 80;
        const size = 4 + Math.random() * 6;
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((angle * Math.PI) / 180) * distance,
              y: Math.sin((angle * Math.PI) / 180) * distance,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: colors[i % colors.length],
            }}
          />
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════
export default function MatchesPage() {
  const searchParams = useSearchParams();

  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [needs, setNeeds] = useState<CommunityNeed[]>([]);
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOpenNeedsCount, setTotalOpenNeedsCount] = useState(0);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [confettiId, setConfettiId] = useState<string | null>(null);

  // average score for the gauge
  const avgScore = matches.length > 0
    ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
    : 0;

  // ── bootstrap data ──
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1 — resolve volunteer id
        let volId = searchParams.get('volunteerId') || '';
        if (!volId && typeof window !== 'undefined') {
          volId = localStorage.getItem('cp_volunteer_id') || '';
        }

        let vol: Volunteer | null = null;

        if (volId) {
          vol = await getVolunteerById(volId);
        }

        // fallback: pick first volunteer in db (demo convenience)
        if (!vol) {
          const allVols = await getVolunteers();
          if (allVols.length > 0) vol = allVols[0];
        }

        if (!vol) {
          setLoading(false);
          return;
        }

        setVolunteer(vol);
        console.log('MatchesPage: Resolved Volunteer:', vol);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('cp_volunteer_id', vol.id);
        }

        // 2 — fetch open needs
        const allNeeds = await getNeeds();
        console.log('MatchesPage: Total Needs in DB:', allNeeds.length);
        allNeeds.forEach(n => console.log(`Need: ${n.title} | Status: ${n.status}`));
        
        const openNeeds = allNeeds.filter(n => 
          n.status?.toLowerCase() === 'open' || !n.status
        );
        console.log('MatchesPage: Filtered Open Needs:', openNeeds.length, openNeeds);
        setNeeds(openNeeds);
        setTotalOpenNeedsCount(openNeeds.length);

        // 3 — run Hybrid matching (Algorithmic + Gemini)
        console.log('MatchesPage: Running Hybrid Matching...');
        const hybridMatches = await getHybridMatches(vol, openNeeds);
        setMatches(hybridMatches);
      } catch (err) {
        console.error('Bootstrap error:', err);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [searchParams]);

  // ── accept mission handler ──
  const handleAccept = useCallback(async (match: VolunteerMatch) => {
    if (acceptedIds.has(match.needId)) return;
    setAcceptingId(match.needId);

    try {
      await createMatch({
        volunteerId: match.volunteerId,
        needId: match.needId,
        matchScore: match.matchScore,
        aiExplanation: match.aiExplanation,
        status: 'accepted',
      });

      await updateNeed(match.needId, {
        status: NeedStatus.IN_PROGRESS,
        assignedVolunteerId: match.volunteerId,
      });

      setAcceptedIds(prev => new Set(prev).add(match.needId));
      setConfettiId(match.needId);
      setTimeout(() => setConfettiId(null), 1000);

      toast.success('Mission accepted — deploying you now', {
        style: { background: '#1b1f2c', color: '#fff', border: '1px solid rgba(0,212,200,0.3)' },
        iconTheme: { primary: '#00D4C8', secondary: '#0f131f' },
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept mission');
    } finally {
      setAcceptingId(null);
    }
  }, [acceptedIds]);

  // ── helper: find need by id ──
  const needFor = (needId: string) => needs.find(n => n.id === needId);

  // ── initials from volunteer name ──
  const initials = volunteer
    ? volunteer.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  // ══════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#00D4C8]" />
        <span className={cn('text-lg', spaceGrotesk.className)}>Running AI matching engine…</span>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
        <User className="w-12 h-12" />
        <p className={cn('text-lg', spaceGrotesk.className)}>No volunteer profile found</p>
        <p className={cn('text-sm', inter.className)}>Register first or provide a volunteerId param.</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 h-full">
        {/* ─────── LEFT — volunteer profile ─────── */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-6 flex flex-col items-center text-center">
            {/* avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00D4C8] to-[#7C3AED] flex items-center justify-center shadow-[0_0_25px_rgba(0,212,200,0.3)] mb-4">
              <span className={cn('text-2xl font-bold text-white', spaceGrotesk.className)}>
                {initials}
              </span>
            </div>

            <h3 className={cn('text-xl font-bold text-white mb-0.5', spaceGrotesk.className)}>
              {volunteer.name}
            </h3>
            <p className={cn('text-sm text-gray-400 mb-1', inter.className)}>{volunteer.email}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-5">
              <MapPin className="w-3 h-3" />
              {volunteer.city}
            </div>

            {/* skills */}
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {volunteer.skills.map(skill => (
                <CategoryChip
                  key={skill}
                  label={skill.replace('_', ' ')}
                  selected
                  color={SKILL_COLORS[skill] || '#00D4C8'}
                />
              ))}
            </div>

            {/* availability strip */}
            <div className="flex gap-1.5 mb-6">
              {ALL_DAYS.map(day => {
                const active = volunteer.availability.includes(day);
                return (
                  <div
                    key={day}
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors',
                      active
                        ? 'bg-[#00D4C8]/15 text-[#00D4C8] border-[#00D4C8]/30'
                        : 'bg-white/[0.03] text-gray-600 border-white/5'
                    )}
                  >
                    {DAY_SHORT[day]}
                  </div>
                );
              })}
            </div>

            {/* gauge */}
            <ScoreGauge score={avgScore} />
          </GlassCard>

          {/* quick stats */}
          <GlassCard className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{volunteer.availability.length} days / week</span>
            </div>
            <div className="text-xs text-[#00D4C8] font-semibold">{volunteer.serviceRadius} km radius</div>
          </GlassCard>
        </div>

        {/* ─────── RIGHT — match cards ─────── */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d2bbff]" />
              <h2 className={cn('text-xl font-bold', spaceGrotesk.className)}>AI-Generated Matches</h2>
            </div>
            <span className={cn('text-xs text-gray-500', inter.className)}>
              Top {matches.length} results
            </span>
          </div>

          {matches.length === 0 && (
            <GlassCard className="p-10 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-10 h-10 text-gray-600 mb-4" />
              <p className={cn('text-gray-400', spaceGrotesk.className)}>
                {totalOpenNeedsCount === 0 ? 'No open needs in the system' : 'No relevant matches found'}
              </p>
              <p className={cn('text-sm text-gray-500 mt-1', inter.className)}>
                {totalOpenNeedsCount === 0 
                  ? 'There are currently no active crisis reports in the database. Head to the Upload tab to add some.'
                  : 'We couldn\'t find any crises that match your location and skills. Try updating your profile or checking back later.'}
              </p>
            </GlassCard>
          )}

          <AnimatePresence>
            {matches.map((match, idx) => {
              const need = needFor(match.needId);
              const isBest = idx === 0;
              const isAccepted = acceptedIds.has(match.needId);
              const isAccepting = acceptingId === match.needId;
              const showConfetti = confettiId === match.needId;

              return (
                <motion.div
                  key={match.needId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                >
                  <GlassCard
                    className={cn('p-6 relative overflow-hidden transition-shadow', isBest && 'shadow-[0_0_20px_rgba(124,58,237,0.4)]')}
                    glowColor={isBest ? 'rgba(124,58,237,0.4)' : 'rgba(0,212,200,0.2)'}
                  >
                    {/* confetti overlay */}
                    {showConfetti && <ConfettiBurst />}

                    {/* best badge */}
                    {isBest && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#7C3AED] to-transparent px-4 py-1 rounded-bl-xl">
                        <span className={cn('text-[10px] uppercase tracking-widest font-bold text-white', inter.className)}>
                          Best Match
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {need && <UrgencyBadge level={getUrgencyLevel(need.urgencyScore)} />}
                          {/* match score badge */}
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[11px] font-bold border',
                            match.matchScore >= 80
                              ? 'text-[#00D4C8] border-[#00D4C8]/30 bg-[#00D4C8]/10'
                              : match.matchScore >= 50
                              ? 'text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10'
                              : 'text-gray-400 border-white/10 bg-white/5'
                          )}>
                            {match.matchScore}% match
                          </span>
                        </div>

                        <h3 className={cn('text-lg font-bold text-white mb-1', spaceGrotesk.className)}>
                          {need?.title || 'Community Need'}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {need?.location || 'Unknown'}
                          </span>
                        </div>

                        {/* AI explanation */}
                        <p className={cn('text-sm italic text-[#00D4C8]/80 leading-relaxed', inter.className)}>
                          &ldquo;{match.aiExplanation}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* action row */}
                    <div className="flex items-center justify-end pt-4 border-t border-white/5">
                      {isAccepted ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2 text-[#00D4C8] font-semibold text-sm"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span className={spaceGrotesk.className}>Mission Accepted ✓</span>
                        </motion.div>
                      ) : (
                        <GradientButton
                          onClick={() => handleAccept(match)}
                          disabled={isAccepting}
                          className="flex items-center gap-2"
                        >
                          {isAccepting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            >
                              <Loader2 className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <Rocket className="w-4 h-4" />
                          )}
                          {isAccepting ? 'Deploying…' : 'Accept Mission'}
                        </GradientButton>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
