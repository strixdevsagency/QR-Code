import React from 'react';
import { Button } from '../ui/Button';

interface StateProps {
  onClose: () => void;
  burnTimestamp?: string;
  codeId?: string;
}

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

