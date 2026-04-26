import React from 'react';
import { cn } from '../../lib/utils';
import { spaceGrotesk, inter } from '../../lib/fonts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  change?: number;
  accentColor?: string;
  sparkline?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  accentColor = '#00D4C8',
  sparkline,
  className
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 flex flex-col",
        className
      )}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.1)'
      }}
    >
      {/* Gradient Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`
        }}
      />
      
      <div className={cn("text-gray-400 text-sm font-medium mb-2", inter.className)}>
        {label}
      </div>
      
      <div className="flex items-end justify-between">
        <div className={cn("text-4xl font-bold text-white", spaceGrotesk.className)}>
          {value}
        </div>
        
        {change !== undefined && (
          <div 
            className={cn(
              "flex items-center text-sm font-semibold mb-1",
              isPositive ? "text-[#00D4C8]" : "text-[#FF6B35]",
              inter.className
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      
      {sparkline && (
        <div className="mt-4 h-12 w-full flex-grow">
          {sparkline}
        </div>
      )}
    </div>
  );
}
