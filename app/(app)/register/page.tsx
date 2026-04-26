'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  UserPlus,
  HeartPulse,
  Truck,
  BookOpen,
  HardHat,
  HandHeart,
  Apple,
  Shield,
  Zap,
  MapPin,
  Loader2,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { spaceGrotesk, inter } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassInput } from '../../../components/ui/GlassInput';
import { GradientButton } from '../../../components/ui/GradientButton';
import { CategoryChip } from '../../../components/ui/CategoryChip';
import { createVolunteer } from '../../../lib/firebase';
import { INDIA_CITIES } from '../../../lib/indiaCities';
import { SkillType, DayOfWeek } from '../../../types';

// ── Skill metadata ──
const SKILLS: { type: SkillType; label: string; color: string; icon: React.ElementType }[] = [
  { type: SkillType.MEDICAL,            label: 'Medical',            color: '#00D4C8', icon: HeartPulse },
  { type: SkillType.LOGISTICS,          label: 'Logistics',          color: '#d2bbff', icon: Truck },
  { type: SkillType.EDUCATION,          label: 'Education',          color: '#fbbf24', icon: BookOpen },
  { type: SkillType.CONSTRUCTION,       label: 'Construction',       color: '#FF6B35', icon: HardHat },
  { type: SkillType.COUNSELLING,        label: 'Counselling',        color: '#a78bfa', icon: HandHeart },
  { type: SkillType.FOOD_DISTRIBUTION,  label: 'Food Distribution',  color: '#34d399', icon: Apple },
];

// ── Day metadata ──
const DAYS: { value: DayOfWeek; short: string }[] = [
  { value: DayOfWeek.MONDAY,    short: 'Mon' },
  { value: DayOfWeek.TUESDAY,   short: 'Tue' },
  { value: DayOfWeek.WEDNESDAY, short: 'Wed' },
  { value: DayOfWeek.THURSDAY,  short: 'Thu' },
  { value: DayOfWeek.FRIDAY,    short: 'Fri' },
  { value: DayOfWeek.SATURDAY,  short: 'Sat' },
  { value: DayOfWeek.SUNDAY,    short: 'Sun' },
];

// ════════════════════════════════════════════════════════
export default function RegisterPage() {
  const router = useRouter();

  // ── form state ──
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(INDIA_CITIES[0].name);
  const [serviceRadius, setServiceRadius] = useState(10);
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // ── Togglers ──
  const toggleSkill = useCallback((skill: SkillType) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  }, []);

  const toggleDay = useCallback((day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation
    if (!name.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (selectedSkills.length === 0) {
      toast.error('Select at least one skill');
      return;
    }
    if (selectedDays.length === 0) {
      toast.error('Select at least one available day');
      return;
    }

    setSubmitting(true);
    console.log('Submitting registration...');

    try {
      const volId = await createVolunteer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        city: city.trim(),
        skills: selectedSkills,
        serviceRadius,
        availability: selectedDays,
        isActive: true,
      });

      console.log('Registration success, ID:', volId);
      localStorage.setItem('cp_volunteer_id', volId);
      setIsDone(true);
      setSubmitting(false);

      toast.success('You\'re in the network!', {
        style: {
          background: '#1b1f2c',
          color: '#fff',
          border: '1px solid rgba(0,212,200,0.3)',
        },
        iconTheme: { primary: '#00D4C8', secondary: '#0f131f' },
      });

      // Keep loading state until redirect
      setTimeout(() => {
        router.push('/matches');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Registration failed — check your connection');
      setSubmitting(false);
    }
  };

  // ════════════════════════════════════════════════════════
  return (
    <>
      <Toaster position="top-right" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[calc(100vh-120px)]">
        {/* ───────── LEFT — visual panel ───────── */}
        <div className="hidden lg:flex flex-col justify-between rounded-2xl p-10 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #006a64 0%, #0f131f 50%, #3f008e 100%)',
          }}
        >
          {/* decorative blur orbs */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00D4C8] rounded-full opacity-15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#7C3AED] rounded-full opacity-15 blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4C8]/30 bg-[#00D4C8]/10 text-[#00D4C8] text-xs font-semibold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4C8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4C8]" />
              </span>
              Recruiting
            </div>

            <h2 className={cn('text-4xl font-bold leading-tight mb-6', spaceGrotesk.className)}>
              Join the Crisis <br />
              Response <span className="text-[#00D4C8]">Network</span>
            </h2>

            <p className={cn('text-gray-400 max-w-sm mb-10', inter.className)}>
              Your skills can save lives. Our AI matches you to the highest-impact
              opportunities in real time.
            </p>

            {/* value props */}
            <div className="flex flex-col gap-4">
              {[
                { icon: Zap, text: 'AI-powered skill matching in under 2 minutes' },
                { icon: MapPin, text: 'Geo-targeted to your city and service radius' },
                { icon: Shield, text: 'Deployed only when urgency meets your profile' },
              ].map((prop, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <prop.icon className="w-4 h-4 text-[#00D4C8]" />
                  </div>
                  {prop.text}
                </div>
              ))}
            </div>
          </div>

          {/* impact stat card */}
          <GlassCard className="relative z-10 p-6 mt-10" glowColor="rgba(124,58,237,0.3)">
            <div className="flex items-center justify-between">
              <div>
                <div className={cn('text-3xl font-bold text-white', spaceGrotesk.className)}>
                  4,821
                </div>
                <div className={cn('text-sm text-gray-400 mt-1', inter.className)}>
                  Volunteers deployed this month
                </div>
              </div>
              <div className="text-[#00D4C8] text-sm font-semibold flex items-center gap-1">
                +12.4%
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ───────── RIGHT — form panel ───────── */}
        <GlassCard className="p-8 lg:p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4C8] to-[#7C3AED] flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={cn('text-xl font-bold', spaceGrotesk.className)}>
                Volunteer Registration
              </h3>
              <p className={cn('text-xs text-gray-400', inter.className)}>
                All fields marked * are required
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
            {/* name + email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>Full Name *</span>
                <GlassInput
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>Email *</span>
                <GlassInput
                  type="email"
                  placeholder="jane@relief.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>
            </div>

            {/* phone + city row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>Phone *</span>
                <GlassInput
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>City *</span>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="bg-[#1a1f2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4C8]/30"
                >
                  {INDIA_CITIES.map(c => (
                    <option key={c.name} value={c.name} className="bg-[#1a1f2e]">{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* service radius */}
            <label className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>Service Radius</span>
                <span className={cn('text-sm font-bold text-[#00D4C8]', spaceGrotesk.className)}>{serviceRadius} km</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={serviceRadius}
                onChange={e => setServiceRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00D4C8]
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00D4C8]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,212,200,0.6)]"
              />
            </label>

            {/* skills */}
            <div className="flex flex-col gap-2">
              <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>Skills *</span>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <CategoryChip
                    key={skill.type}
                    label={skill.label}
                    selected={selectedSkills.includes(skill.type)}
                    color={skill.color}
                    onClick={() => toggleSkill(skill.type)}
                  />
                ))}
              </div>
            </div>

            {/* availability */}
            <div className="flex flex-col gap-2">
              <span className={cn('text-xs uppercase tracking-wider text-gray-400 font-semibold', inter.className)}>Availability *</span>
              <div className="flex gap-2">
                {DAYS.map(day => {
                  const active = selectedDays.includes(day.value);
                  return (
                    <motion.button
                      key={day.value}
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        active
                          ? 'bg-[#00D4C8] text-[#0f131f] border-[#00D4C8] shadow-[0_0_10px_rgba(0,212,200,0.3)]'
                          : 'bg-transparent text-gray-400 border-white/10 hover:border-white/20'
                      )}
                    >
                      {day.short}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* spacer */}
            <div className="flex-1" />

            {/* submit */}
            <GradientButton
              type="submit"
              disabled={submitting || isDone}
              className={cn(
                "w-full py-3 flex items-center justify-center gap-2 text-base transition-all duration-300",
                isDone && "bg-green-500/20 border-green-500/50 text-green-400"
              )}
            >
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5" />
                </motion.div>
              ) : isDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Registration Complete
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Join Network
                </>
              )}
            </GradientButton>
          </form>
        </GlassCard>
      </div>
    </>
  );
}
