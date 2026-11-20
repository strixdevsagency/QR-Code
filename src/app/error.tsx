'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { StrixLogo } from '../components/StrixLogo';
import { RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to error monitoring service if available
    console.error('Unhandled Strix QR Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 text-center selection:bg-zinc-800 selection:text-white">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-zinc-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex justify-center">
          <StrixLogo className="h-9 w-auto" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Rendering Interrupted
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Unexpected Exception
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            An unexpected error occurred during matrix generation or client rendering.
          </p>
          {error.digest && (
            <p className="text-[10px] text-zinc-600 font-mono">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 border border-white/[0.08] text-zinc-300 font-medium text-xs hover:text-white hover:bg-zinc-700 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Studio Home</span>
          </Link>
        </div>
      </div>

      <p className="text-xs text-zinc-600 mt-8">
        Strix QR Engine — Built by StrixDevs
      </p>
    </div>
  );
}
