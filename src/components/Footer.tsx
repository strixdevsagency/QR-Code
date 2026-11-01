import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 mt-16 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-300">StrixQR</span> — Built by{' '}
          <a
            href="https://strixdevs.com"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            StrixDevs
          </a>{' '}
          for businesses in Chicago, New York & Canada.
        </div>

        <div className="flex items-center gap-4">
          <a href="https://strixdevs.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">
            Web & App Dev
          </a>
          <a href="/llms.txt" target="_blank" className="hover:text-slate-300 transition">
            llms.txt
          </a>
          <a href="#sponsor-section" className="hover:text-slate-300 transition">
            Sponsor
          </a>
        </div>
      </div>
    </footer>
  );
};
