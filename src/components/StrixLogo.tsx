import React from 'react';

interface StrixLogoProps {
  className?: string;
  showText?: boolean;
}

export const StrixLogo: React.FC<StrixLogoProps> = ({ className = 'w-8 h-8', showText = true }) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`${className} rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
        SQ
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white">
              StrixQR
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Official
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            by strix-devs
          </span>
        </div>
      )}
    </div>
  );
};
