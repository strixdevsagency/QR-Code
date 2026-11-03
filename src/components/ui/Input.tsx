import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-500 ${
          error ? 'border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || props.name;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder:text-slate-500 ${
          error ? 'border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
