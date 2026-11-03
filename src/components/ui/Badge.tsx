import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate' | 'cyan';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'sm',
  className = '',
}) => {
  const base = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  }[size];

  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  }[variant];

  return <span className={`${base} ${sizes} ${variants} ${className}`}>{children}</span>;
};
