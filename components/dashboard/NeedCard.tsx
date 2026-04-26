import React from 'react';
import { CommunityNeed, NeedCategory } from '../../types';
import { UrgencyBadge } from '../ui/UrgencyBadge';
import { GradientButton } from '../ui/GradientButton';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Users, HeartPulse, Apple, BookOpen, Home, ShieldAlert, AlertCircle } from 'lucide-react';
import { cn, toDate } from '../../lib/utils';
import { spaceGrotesk, inter } from '../../lib/fonts';
import Link from 'next/link';

const CategoryIconMap: Record<NeedCategory | string, React.ElementType> = {
  [NeedCategory.MEDICAL]: HeartPulse,
  [NeedCategory.FOOD]: Apple,
  [NeedCategory.EDUCATION]: BookOpen,
  [NeedCategory.HOUSING]: Home,
  [NeedCategory.SAFETY]: ShieldAlert,
  [NeedCategory.OTHER]: AlertCircle,
};

const CategoryColorMap: Record<NeedCategory | string, string> = {
  [NeedCategory.MEDICAL]: '#00D4C8', // teal
  [NeedCategory.FOOD]: '#d2bbff', // violet
  [NeedCategory.EDUCATION]: '#fbbf24', // amber
  [NeedCategory.HOUSING]: '#FF6B35', // coral
  [NeedCategory.SAFETY]: '#ef4444', // red
  [NeedCategory.OTHER]: '#9ca3af', // gray
};

export function NeedCard({ need }: { need: CommunityNeed }) {
  const Icon = CategoryIconMap[need.category] || CategoryIconMap[NeedCategory.OTHER];
  const color = CategoryColorMap[need.category] || CategoryColorMap[NeedCategory.OTHER];

  const getUrgencyLevel = (score: number) => {
    if (score >= 8) return 'CRITICAL';
    if (score >= 6) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  };

  const timeAgo = need.createdAt 
    ? formatDistanceToNow(toDate(need.createdAt), { addSuffix: true })
    : 'just now';

  return (
    <div className="bg-[#0f131f]/80 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-5 hover:border-[#00D4C8]/30 transition-all group overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20"
            style={{ backgroundColor: `${color}33`, color: color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={cn("text-white font-bold text-base md:text-lg truncate", spaceGrotesk.className)}>{need.title}</h3>
            <div className="text-gray-400 text-xs flex items-center gap-2 mt-1">
              <span>{timeAgo}</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <UrgencyBadge level={getUrgencyLevel(need.urgencyScore)} />
            </div>
          </div>
        </div>
      </div>

      <p className={cn("text-gray-300 text-sm mb-4 line-clamp-2", inter.className)}>
        {need.description}
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{need.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{need.affectedCount} affected</span>
          </div>
        </div>

        <Link href={`/matches?needId=${need.id}`}>
          <GradientButton variant="ghost" className="py-1.5 px-4 text-xs font-semibold">
            Find Match
          </GradientButton>
        </Link>
      </div>
    </div>
  );
}
