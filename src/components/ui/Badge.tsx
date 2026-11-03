import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'sm',
  className = '',
}) => {
  const base = 'inline-flex items-center font-medium rounded-full border select-none';

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  }[size];

  const variants = {
    emerald: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50',
    blue: 'bg-blue-950/40 text-blue-300 border-blue-800/50',
    amber: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
    rose: 'bg-rose-950/40 text-rose-300 border-rose-800/50',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
  }[variant];

  return <span className={`${base} ${sizes} ${variants} ${className}`}>{children}</span>;
};
