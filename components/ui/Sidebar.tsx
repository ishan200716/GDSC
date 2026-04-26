'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  HeartHandshake, 
  BarChart3} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Upload', icon: Upload, href: '/upload' },
  { name: 'Volunteers', icon: Users, href: '/volunteers' },
  { name: 'Matches', icon: HeartHandshake, href: '/matches' },
  { name: 'Analytics', icon: BarChart3, href: '/analytics' },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* ─── Desktop / Tablet: vertical sidebar ─── */}
      <aside 
        className={cn(
          "hidden md:flex w-12 lg:w-[64px] h-screen fixed left-0 top-0 flex-col items-center py-6 border-r z-50",
          className
        )}
        style={{
          backgroundColor: '#0f131f',
          borderColor: 'rgba(255,255,255,0.05)'
        }}
      >
        <Link href="/">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-[#00D4C8] to-[#7C3AED] mb-12 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,200,0.4)] hover:scale-110 transition-transform cursor-pointer">
            <span className="text-white font-bold text-sm lg:text-lg leading-none">C</span>
          </div>
        </Link>
        
        <nav className="flex flex-col gap-4 lg:gap-6 w-full items-center flex-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative group"
                title={item.name}
              >
                <motion.div
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "p-2.5 lg:p-3 rounded-xl transition-colors duration-300",
                    isActive 
                      ? "text-[#00D4C8] bg-[#00D4C8]/10 shadow-[0_0_10px_rgba(0,212,200,0.2)]" 
                      : "text-gray-500 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </motion.div>
                
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute -left-3 lg:-left-4 top-1/2 -translate-y-1/2 w-1 h-6 lg:h-8 bg-[#00D4C8] rounded-r-full shadow-[0_0_8px_#00D4C8]" 
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ─── Mobile: bottom navigation bar ─── */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t safe-area-bottom"
        style={{
          backgroundColor: '#0f131f',
          borderColor: 'rgba(255,255,255,0.05)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all",
                isActive
                  ? "text-[#00D4C8]"
                  : "text-gray-500"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name.slice(0, 6)}</span>
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-active"
                  className="absolute top-0 w-8 h-0.5 bg-[#00D4C8] rounded-b-full shadow-[0_0_8px_#00D4C8]" 
                />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
