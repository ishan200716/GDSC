'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { spaceGrotesk } from '../../lib/fonts';

interface GradientButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
  variant?: 'primary' | 'ghost' | 'danger';
  children: React.ReactNode;
}

export function GradientButton({ variant = 'primary', className, children, ...props }: GradientButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-[#00D4C8] to-[#7C3AED] text-white hover:shadow-[0_0_15px_rgba(0,212,200,0.5)] border border-transparent",
    ghost: "bg-transparent text-[#00D4C8] hover:bg-[#00D4C8]/10 border border-[#00D4C8] hover:shadow-[0_0_15px_rgba(0,212,200,0.5)]",
    danger: "bg-error text-on-error hover:shadow-[0_0_15px_rgba(255,180,171,0.5)] border border-transparent",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-6 py-2.5 rounded-lg font-semibold transition-all duration-300",
        spaceGrotesk.className,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
