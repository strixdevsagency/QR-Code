import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2',
  }[size];

  const variantStyles = {
    primary: 'bg-[#38bdf8] hover:bg-[#7dd3fc] active:bg-[#0284c7] text-[#09090b] font-bold shadow-lg shadow-[#38bdf8]/20 border border-[#38bdf8]/40 active:scale-[0.98]',
    secondary: 'bg-zinc-900/90 hover:bg-zinc-800 active:bg-zinc-900 text-zinc-200 border border-white/[0.08] hover:border-[#38bdf8]/30 active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-[#38bdf8]/10 active:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 hover:border-[#38bdf8] active:scale-[0.98]',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 border border-rose-500/30 active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-zinc-800/60 active:bg-zinc-800 text-zinc-400 hover:text-white active:scale-[0.98]',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
