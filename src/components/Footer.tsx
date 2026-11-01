import React from 'react';
import { StrixLogo } from './StrixLogo';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <StrixLogo />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            Built by <strong className="text-slate-800 dark:text-slate-200">StrixDevs</strong> to empower business owners across Chicago, New York, Toronto, and worldwide with free permanent QR solutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a
            href="https://strixdevs.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1"
          >
            <span>StrixDevs Services</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/llms.txt"
            target="_blank"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            AI llms.txt
          </a>
          <a
            href="#sponsor-section"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            Advertise / Sponsor
          </a>
          <span className="text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} StrixDevs.
          </span>
        </div>
      </div>
    </footer>
  );
};
