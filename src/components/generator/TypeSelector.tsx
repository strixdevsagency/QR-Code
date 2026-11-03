import React from 'react';
import type { QRType } from '../../types';

interface TypeSelectorProps {
  payloadType: QRType;
  setPayloadType: (type: QRType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  payloadType,
  setPayloadType,
}) => {
  const types: { id: QRType; label: string }[] = [
    { id: 'url', label: 'URL / Link' },
    { id: 'wifi', label: 'WiFi Network' },
    { id: 'vcard', label: 'vCard Contact' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
    { id: 'crypto', label: 'Crypto Pay' },
    { id: 'text', label: 'Plain Text' },
  ];

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Select Data Payload Type
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPayloadType(t.id)}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
              payloadType === t.id
                ? 'border-blue-600 bg-blue-950/40 text-white shadow-sm'
                : 'border-slate-800 bg-[#090d16] text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};
