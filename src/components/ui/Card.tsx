import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const base = 'rounded-3xl border border-slate-800 transition-colors duration-200';

  const variants = {
    default: 'bg-slate-900 shadow-xl shadow-indigo-950/20',
    elevated: 'bg-slate-900/90 backdrop-blur-md shadow-2xl shadow-indigo-950/40',
    glass: 'bg-slate-900/60 backdrop-blur-sm',
  }[variant];

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6 sm:p-7',
    lg: 'p-6 sm:p-10',
  }[padding];

  return (
    <div className={`${base} ${variants} ${paddings} ${className}`} {...props}>
      {children}
    </div>
  );
};
