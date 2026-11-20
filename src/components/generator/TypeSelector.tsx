import React from 'react';
import { Link2, Wifi, UserCheck, MessageSquare, Mail, Coins, AlignLeft, Smartphone } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';
import type { QRType } from '../../types';

interface TypeSelectorProps {
  payloadType: QRType;
  setPayloadType: (type: QRType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  payloadType,
  setPayloadType,
}) => {
  const types: { id: QRType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'URL / Link', icon: <Link2 className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'wifi', label: 'WiFi Network', icon: <Wifi className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'vcard', label: 'vCard Contact', icon: <UserCheck className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'sms', label: 'SMS Message', icon: <Smartphone className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'crypto', label: 'Crypto Pay', icon: <Coins className="w-3.5 h-3.5" aria-hidden="true" /> },
    { id: 'text', label: 'Plain Text', icon: <AlignLeft className="w-3.5 h-3.5" aria-hidden="true" /> },
  ];

  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
        Payload Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {types.map((t) => {
          const isActive = payloadType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playTactileClick();
                setPayloadType(t.id);
              }}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.96] hover:-translate-y-0.5 ${
                isActive
                  ? 'border-[#38bdf8]/50 bg-[#38bdf8]/15 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10 ring-1 ring-[#38bdf8]/25 font-semibold'
                  : 'border-white/[0.08] bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-white/[0.15] hover:bg-zinc-900/50'
              }`}
            >
              <span className={isActive ? 'text-[#38bdf8]' : 'text-zinc-500'}>{t.icon}</span>
              <span className="whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
