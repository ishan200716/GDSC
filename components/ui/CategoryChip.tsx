'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { inter } from '../../lib/fonts';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function CategoryChip({ 
  label, 
  selected, 
  color = '#00D4C8', 
  onClick,
  className 
}: CategoryChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
        inter.className,
        className
      )}
      style={{
        backgroundColor: selected ? color : 'transparent',
        borderColor: color,
        color: selected ? '#0f131f' : color,
      }}
    >
      {label}
    </motion.button>
  );
}
