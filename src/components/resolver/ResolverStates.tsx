import React, { useState } from 'react';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface StateProps {
  onClose: () => void;
  burnTimestamp?: string;
  codeId?: string;
}

interface PinRequiredProps extends StateProps {
  onSubmitPin: (pin: string) => boolean | Promise<boolean>;
}

export const PinRequiredState: React.FC<PinRequiredProps> = ({ onClose, onSubmitPin }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setError('Please enter a valid 4-digit PIN.');
      return;
    }
    const success = await onSubmitPin(pin);
    if (!success) {
      setError('Incorrect PIN. Access denied.');
      setPin('');
    } else {
      setError(null);
    }
  };

  return (
    <div className="space-y-5 py-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>
      <div>
        <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
          Security Verification Required
        </span>
        <h3 className="text-xl font-bold text-white mt-3">Confidential PIN Protected QR</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
          The creator of this QR code requires a 4-digit PIN to access this destination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-xs mx-auto">
        <input
          type="password"
          maxLength={6}
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          className="w-full text-center tracking-[1em] text-lg font-mono py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        <Button variant="primary" fullWidth type="submit">
          Unlock Destination
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      <Button variant="secondary" fullWidth onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
};

export const BurnedState: React.FC<StateProps> = ({ onClose, burnTimestamp }) => (
  <div className="space-y-5 py-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
      🔥
    </div>
    <div>
      <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
        Access Expired & Burned
      </span>
      <h3 className="text-xl font-bold text-white mt-3">This One-Time QR Code Has Self-Destructed</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
        This QR code was configured for single-use access only. It was scanned and permanently removed from our active network for security.
      </p>
    </div>
    {burnTimestamp && (
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
        Burned: {new Date(burnTimestamp).toLocaleString()}
      </div>
    )}
    <Button variant="secondary" fullWidth onClick={onClose}>
      Generate Your Own Free QR Code
    </Button>
  </div>
);

export const ExpiredState: React.FC<StateProps> = ({ onClose }) => (
  <div className="space-y-5 py-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl font-bold">
      ⏱
    </div>
    <div>
      <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
        Time Window Expired
      </span>
      <h3 className="text-xl font-bold text-white mt-3">This Temporary QR Code Has Expired</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
        The promotional time limit set by the issuer has elapsed. To request a new access link, contact the provider.
      </p>
    </div>
    <Button variant="secondary" fullWidth onClick={onClose}>
      Return to Strix QR
    </Button>
  </div>
);

export const RevokedState: React.FC<StateProps> = ({ onClose }) => (
  <div className="space-y-5 py-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto text-2xl font-bold">
      ⚠️
    </div>
    <div>
      <h3 className="text-xl font-bold text-white">Access Deactivated</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
        The creator has paused or permanently revoked access to this QR code.
      </p>
    </div>
    <Button variant="secondary" fullWidth onClick={onClose}>
      Close
    </Button>
  </div>
);

export const NotFoundState: React.FC<StateProps> = ({ onClose, codeId }) => (
  <div className="space-y-5 py-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto text-2xl font-bold">
      ?
    </div>
    <div>
      <h3 className="text-xl font-bold text-white">QR Code Not Found</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
        The requested QR code ID ({codeId}) does not exist in our system or may have been deleted by the owner.
      </p>
    </div>
    <Button variant="secondary" fullWidth onClick={onClose}>
      Go to Strix QR
    </Button>
  </div>
);
