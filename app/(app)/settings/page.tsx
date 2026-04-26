'use client';

import React from 'react';
import { cn } from '../../../lib/utils';
import { spaceGrotesk, inter } from '../../../lib/fonts';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Settings, Bell, Lock, User, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 h-full">
      <div>
        <h2 className={cn("text-2xl md:text-3xl font-bold flex items-center gap-3", spaceGrotesk.className)}>
          <Settings className="w-8 h-8 text-[#00D4C8]" />
          Platform Settings
        </h2>
        <p className={cn("text-gray-400 mt-2 text-sm md:text-base", inter.className)}>
          Manage your account preferences, notification rules, and system configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#d2bbff]" />
            <h3 className={cn("font-bold text-lg", spaceGrotesk.className)}>Profile</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Update your coordinator details and role.</p>
          <button className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
            Edit Profile
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[#FF6B35]" />
            <h3 className={cn("font-bold text-lg", spaceGrotesk.className)}>Notifications</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Configure alert thresholds for urgent needs.</p>
          <button className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
            Manage Alerts
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-[#fbbf24]" />
            <h3 className={cn("font-bold text-lg", spaceGrotesk.className)}>Security</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">API keys and access control settings.</p>
          <button className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
            View Settings
          </button>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-[#00D4C8]" />
            <h3 className={cn("font-bold text-lg", spaceGrotesk.className)}>Appearance</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Customize the dashboard layout and theme.</p>
          <button className="text-sm px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
            Customize
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
