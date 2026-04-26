'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { spaceGrotesk } from '../../lib/fonts';
import { cn } from '../../lib/utils';
import { GlassInput } from '../ui/GlassInput';
import { CategoryChip } from '../ui/CategoryChip';

const routeNames: Record<string, string> = {
  '/dashboard': 'Mission Control',
  '/upload': 'Data Upload',
  '/volunteers': 'Volunteers',
  '/matches': 'Active Matches',
  '/analytics': 'System Analytics',
  '/settings': 'Settings',
};

export function Header() {
  const pathname = usePathname();
  const baseRoute = `/${pathname?.split('/')[1] || ''}`;
  const title = routeNames[baseRoute] || 'Overview';

  return (
    <header className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-white/5 bg-[#0f131f]/60 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-4">
      <div className="flex flex-col min-w-0">
        <h1 className={cn("text-lg md:text-2xl font-bold text-white truncate", spaceGrotesk.className)}>
          {title}
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-0.5 md:mt-1 hidden sm:block">System Operational</p>
      </div>

      <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
        {baseRoute === '/dashboard' && (
          <div className="hidden xl:flex items-center gap-2 mr-4">
            <CategoryChip label="All" selected={true} />
            <CategoryChip label="Critical" selected={false} color="#FF6B35" />
            <CategoryChip label="Medical" selected={false} color="#00D4C8" />
            <CategoryChip label="Logistics" selected={false} color="#d2bbff" />
          </div>
        )}

        <div className="relative hidden sm:block w-40 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <GlassInput 
            placeholder="Search…" 
            className="pl-10 py-2 text-sm h-10"
          />
        </div>

        {/* Removed Bell button */}
      </div>
    </header>
  );
}
