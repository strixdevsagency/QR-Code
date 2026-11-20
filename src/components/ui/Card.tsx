import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const base = 'rounded-2xl border border-white/[0.08] transition-colors';

  const variants = {
    default: 'bg-zinc-900/60 backdrop-blur-sm shadow-sm',
    elevated: 'bg-zinc-900/80 backdrop-blur-md shadow-xl border-white/[0.12]',
    subtle: 'bg-zinc-950/40',
  }[variant];

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 sm:p-8',
  }[padding];

  return (
    <div className={`${base} ${variants} ${paddings} ${className}`} {...props}>
      {children}
    </div>
  );
};
