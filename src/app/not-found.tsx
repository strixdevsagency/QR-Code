import Link from 'next/link';
import { StrixLogo } from '../components/StrixLogo';
import { ArrowLeft, Home, QrCode } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 text-center selection:bg-zinc-800 selection:text-white">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-zinc-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex justify-center">
          <StrixLogo className="h-9 w-auto" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            404 Optical Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Destination Not Found
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The QR target, dynamic route, or page you were trying to access does not exist or has expired.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Studio</span>
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 border border-white/[0.08] text-zinc-300 font-medium text-xs hover:text-white hover:bg-zinc-700 transition-all active:scale-95"
          >
            <span>Contact Support</span>
          </Link>
        </div>
      </div>

      <p className="text-xs text-zinc-600 mt-8">
        Strix QR Engine — Built by StrixDevs
      </p>
    </div>
  );
}
