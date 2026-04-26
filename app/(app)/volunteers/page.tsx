'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Search,
  Filter,
  HeartPulse,
  Truck,
  BookOpen,
  HardHat,
  HandHeart,
  Apple
} from 'lucide-react';
import { useVolunteers } from '../../../hooks/useVolunteers';
import { SkillType } from '../../../types';
import { cn } from '../../../lib/utils';
import { spaceGrotesk, inter } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GradientButton } from '../../../components/ui/GradientButton';
import { SkeletonCard } from '../../../components/ui/SkeletonCard';

// -- Skill Icon Helper --
const skillIcons: Record<SkillType, any> = {
  [SkillType.MEDICAL]: HeartPulse,
  [SkillType.LOGISTICS]: Truck,
  [SkillType.EDUCATION]: BookOpen,
  [SkillType.CONSTRUCTION]: HardHat,
  [SkillType.COUNSELLING]: HandHeart,
  [SkillType.FOOD_DISTRIBUTION]: Apple,
};

const skillColors: Record<SkillType, string> = {
  [SkillType.MEDICAL]: '#00D4C8',
  [SkillType.LOGISTICS]: '#d2bbff',
  [SkillType.EDUCATION]: '#fbbf24',
  [SkillType.CONSTRUCTION]: '#FF6B35',
  [SkillType.COUNSELLING]: '#a78bfa',
  [SkillType.FOOD_DISTRIBUTION]: '#34d399',
};

export default function VolunteersPage() {
  const { volunteers, loading } = useVolunteers();

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={cn("text-3xl font-bold mb-2", spaceGrotesk.className)}>
            Response <span className="text-[#00D4C8]">Network</span>
          </h1>
          <p className={cn("text-gray-400 max-w-xl", inter.className)}>
            Meet the volunteers dedicated to real-time crisis response. Our AI matches their skills to the community&apos;s most urgent needs.
          </p>
        </div>

        <Link href="/register">
          <GradientButton className="flex items-center gap-2 px-6 py-3 whitespace-nowrap">
            <UserPlus className="w-5 h-5" />
            Become a Volunteer
          </GradientButton>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Network', value: volunteers.length, icon: Users, color: '#00D4C8' },
          { label: 'Active Today', value: Math.floor(volunteers.length * 0.4), icon: Calendar, color: '#7C3AED' },
          { label: 'Avg Radius', value: '15km', icon: MapPin, color: '#FF6B35' },
          { label: 'Top Skill', value: 'Medical', icon: HeartPulse, color: '#fbbf24' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-4 flex items-center gap-4 border-l-2" style={{ borderLeftColor: stat.color }}>
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-xl font-bold text-white leading-none">{loading ? '...' : stat.value}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold">{stat.label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#00D4C8] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, skill, or city..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4C8]/30 focus:border-[#00D4C8]/50 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Volunteers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} className="h-[280px]" />
          ))
        ) : (
          <AnimatePresence>
            {volunteers.map((vol, index) => (
              <motion.div
                key={vol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <GlassCard className="h-full p-6 group hover:border-[#00D4C8]/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4C8]/20 to-[#7C3AED]/20 border border-white/10 flex items-center justify-center text-lg font-bold text-[#00D4C8]">
                        {vol.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className={cn("font-bold text-white group-hover:text-[#00D4C8] transition-colors", spaceGrotesk.className)}>
                          {vol.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3 text-[#FF6B35]" />
                          {vol.city}
                        </div>
                      </div>
                    </div>
                    {vol.isActive && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </div>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {vol.skills.map((skill) => {
                      const Icon = skillIcons[skill as SkillType] || HeartPulse;
                      return (
                        <div 
                          key={skill}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium"
                          style={{ color: skillColors[skill as SkillType] }}
                        >
                          <Icon className="w-3 h-3" />
                          {skill.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>

                  {/* Contact Info Footer */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-3">
                      <button title="Email" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#00D4C8] transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button title="Phone" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#00D4C8] transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Link href={`/matches?volunteerId=${vol.id}`}>
                      <button className="text-xs font-semibold text-[#00D4C8] hover:underline flex items-center gap-1">
                        View Matches
                      </button>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {volunteers.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className={cn("text-xl font-bold mb-2", spaceGrotesk.className)}>No volunteers found</h2>
          <p className="text-gray-400 max-w-xs mx-auto mb-8">
            The volunteer network is currently empty. Be the first to join and help your community.
          </p>
          <Link href="/register">
            <GradientButton className="px-8">
              Join the Network
            </GradientButton>
          </Link>
        </div>
      )}
    </div>
  );
}
