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
  const base = 'rounded-2xl border border-slate-800 transition-colors';

  const variants = {
    default: 'bg-[#111827] shadow-sm',
    elevated: 'bg-[#111827] shadow-md border-slate-750',
    subtle: 'bg-[#0f172a]/60',
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
