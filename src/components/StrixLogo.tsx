import React from 'react';

interface StrixLogoProps {
  className?: string;
  showText?: boolean;
}

export const StrixLogo: React.FC<StrixLogoProps> = ({ className = 'w-8 h-8', showText = true }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${className} relative flex items-center justify-center shrink-0`}>
        {/* Modern Hexagon / Circuit Matrix Monogram for Strix */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <rect width="40" height="40" rx="10" fill="url(#strixGrad)" />
          {/* QR Corner Anchor Accent */}
          <rect x="8" y="8" width="10" height="10" rx="3" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="11.5" y="11.5" width="3" height="3" rx="1" fill="#ffffff" />
          {/* S-curve path representing Strix */}
          <path
            d="M27 10C24 10 22 11.5 22 14C22 18 29 17 29 22C29 25 26.5 26.5 23 26.5"
            stroke="#ffffff"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          <path d="M12 25H18" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 29H15" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="strixGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4f46e5" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Strix<span className="text-indigo-600 dark:text-indigo-400">QR</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              PRO
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
            by strix-devs
          </span>
        </div>
      )}
    </div>
  );
};
