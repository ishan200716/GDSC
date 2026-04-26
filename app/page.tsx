'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { spaceGrotesk, inter } from '../lib/fonts';
import { GradientButton } from '../components/ui/GradientButton';
import { GlassCard } from '../components/ui/GlassCard';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f131f] text-white overflow-x-hidden relative flex flex-col">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 bg-mesh-navy-violet opacity-50 pointer-events-none" />
      
      {/* Floating Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full h-16 md:h-20 z-50 border-b border-white/5 bg-[#0f131f]/60 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className={cn("text-xl md:text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-[#00D4C8]", spaceGrotesk.className)}>
            C<span className="text-[#00D4C8]">ommunity</span>P<span className="text-[#00D4C8]">ulse</span>
          </div>
        </Link>
        
        <div className={cn("hidden md:flex items-center gap-8 text-sm font-medium text-gray-400", inter.className)}>
          <Link href="#hero" className="hover:text-white transition-colors">Intelligence</Link>
          <Link href="#hero" className="hover:text-white transition-colors">Network</Link>
          <Link href="#hero" className="hover:text-white transition-colors">Solutions</Link>
          <Link href="#hero" className="hover:text-white transition-colors">Impact</Link>
        </div>
        
        <Link href="/dashboard">
          <GradientButton variant="primary" className="py-1.5 md:py-2 text-xs md:text-sm">
            Log In
          </GradientButton>
        </Link>
      </motion.nav>

      {/* Hero Section */}
      <main id="hero" className="flex-1 flex flex-col items-center justify-center pt-32 md:pt-48 pb-12 md:pb-20 relative z-10 px-4">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4C8]/30 bg-[#00D4C8]/10 text-[#00D4C8] text-xs font-semibold uppercase tracking-widest mb-6 md:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4C8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4C8]"></span>
            </span>
            Mission Control Online
          </motion.div>

          <motion.h1 
            variants={fadeInUp}
            className={cn(
              "text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-tight mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400",
              spaceGrotesk.className
            )}
          >
            Turn Community Data <br/> Into Urgent Action
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className={cn("text-base md:text-xl text-gray-400 max-w-2xl mb-8 md:mb-12 px-2", inter.className)}
          >
            AI-powered platform that transforms scattered NGO surveys into real-time need intelligence — and matches the right volunteer to every crisis.
          </motion.p>

          {/* CTA buttons — stack vertically on mobile */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <GradientButton className="text-base md:text-lg px-8 py-3 md:py-4 flex items-center justify-center gap-2 w-full">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <GradientButton variant="ghost" className="text-base md:text-lg px-8 py-3 md:py-4 w-full">
                Join Network
              </GradientButton>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Stats Bar — 2x2 grid on mobile, 3-col on md+ */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="w-full relative z-10 px-4 pb-12 md:pb-20 max-w-6xl mx-auto"
      >
        <GlassCard className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Globe className="w-6 h-6 md:w-8 md:h-8 text-[#00D4C8] mb-3 md:mb-4" />
            <div className={cn("text-2xl md:text-4xl font-bold text-white mb-1", spaceGrotesk.className)}>14.2k</div>
            <div className={cn("text-[10px] md:text-sm text-gray-400 uppercase tracking-wider font-semibold", inter.className)}>Active Needs</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-[#d2bbff] mb-3 md:mb-4" />
            <div className={cn("text-2xl md:text-4xl font-bold text-white mb-1", spaceGrotesk.className)}>98.4%</div>
            <div className={cn("text-[10px] md:text-sm text-gray-400 uppercase tracking-wider font-semibold", inter.className)}>Match Accuracy</div>
          </div>
          <div className="flex flex-col items-center justify-center col-span-2 md:col-span-1">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-[#FF6B35] mb-3 md:mb-4" />
            <div className={cn("text-2xl md:text-4xl font-bold text-white mb-1", spaceGrotesk.className)}>&lt; 2m</div>
            <div className={cn("text-[10px] md:text-sm text-gray-400 uppercase tracking-wider font-semibold", inter.className)}>Response Time</div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#0f131f]/80 backdrop-blur-md py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className={cn("text-xl font-bold tracking-tight text-white", spaceGrotesk.className)}>
            Community<span className="text-[#00D4C8]">Pulse</span>
          </div>
          
          <div className={cn("flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-gray-400", inter.className)}>
            <Link href="#hero" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#hero" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#hero" className="hover:text-white transition-colors">System Status</Link>
            <Link href="#hero" className="hover:text-white transition-colors">Contact</Link>
          </div>
          
          <div className="text-xs text-gray-500 font-mono">
            &copy; 2024 CP_INTEL_SYSTEM.ALL_RIGHTS_RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
