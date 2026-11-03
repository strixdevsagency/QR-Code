import React from 'react';
import type { SavedLogo } from '../../types';
import { Button } from '../ui/Button';

interface LogoLibraryProps {
  logos: SavedLogo[];
  onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteLogo: (id: string) => void;
}

export const LogoLibrary: React.FC<LogoLibraryProps> = ({
  logos,
  onUploadLogo,
  onDeleteLogo,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Saved company logos and branding assets to use when generating QR codes.
        </p>
        <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition">
          + Upload Brand Logo
          <input
            type="file"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={onUploadLogo}
            className="hidden"
          />
        </label>
      </div>

      {logos.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800">
          <p className="text-slate-400 text-xs">No brand logos uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {logos.map((lg) => (
            <div
              key={lg.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-between gap-2.5 text-center"
            >
              <img src={lg.url} alt={lg.name} className="w-10 h-10 object-contain my-2" />
              <span className="text-xs text-slate-300 font-medium truncate w-full">{lg.name}</span>
              <Button variant="danger" size="sm" onClick={() => onDeleteLogo(lg.id)} fullWidth>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

