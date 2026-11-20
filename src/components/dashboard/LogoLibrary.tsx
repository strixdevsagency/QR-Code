import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { SavedLogo } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModal';
import { playTactileClick } from '../../utils/audioFeedback';

interface LogoLibraryProps {
  logos: SavedLogo[];
  onUploadLogo: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteLogo: (id: string) => void;
  onSelectLogoForGenerator?: (logoUrl: string) => void;
}

export const LogoLibrary: React.FC<LogoLibraryProps> = ({
  logos,
  onUploadLogo,
  onDeleteLogo,
  onSelectLogoForGenerator,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [logoToDelete, setLogoToDelete] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files && files[0]) {
            const fakeEvent = {
              target: { files },
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onUploadLogo(fakeEvent);
          }
        }}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/[0.12] hover:border-white/[0.25] bg-zinc-900/40'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-300">
          <UploadCloud className="w-6 h-6 text-blue-400" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-white">Upload Brand Mark or Corporate Logo</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-md">
            Drag and drop vector SVG, transparent PNG, or high-res JPG files. Saved assets are encrypted client-side in your private vault.
          </p>
        </div>

        <label className="mt-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition active:scale-[0.98] shadow-md shadow-blue-600/20">
          Select File from Device
          <input
            type="file"
            accept="image/png, image/jpeg, image/svg+xml"
            onChange={onUploadLogo}
            className="hidden"
          />
        </label>
      </div>

      {/* Logo Grid */}
      {logos.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-zinc-900/40 border border-white/[0.08]">
          <ImageIcon className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-xs text-zinc-400">No brand assets stored yet in your vault.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((lg) => (
            <div
              key={lg.id}
              className="p-4 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between gap-3 group shadow-lg shadow-black/20"
            >
              {/* Checkerboard Backdrop for Transparent Logos */}
              <div className="w-full h-28 rounded-xl bg-zinc-950 border border-white/[0.06] flex items-center justify-center p-3 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #ffffff 10%, transparent 11%)',
                    backgroundSize: '10px 10px',
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lg.url}
                  alt={lg.name}
                  className="max-h-20 max-w-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Asset Name & Meta */}
              <div className="space-y-1">
                <span className="text-xs text-white font-semibold truncate block" title={lg.name}>
                  {lg.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  Added {new Date(lg.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {onSelectLogoForGenerator && (
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      onSelectLogoForGenerator(lg.url);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[11px] font-medium flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <span>Use</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setLogoToDelete({ id: lg.id, name: lg.name });
                  }}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                  title="Remove asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!logoToDelete}
        title="Remove Brand Asset"
        message={`Remove "${logoToDelete?.name}" from your cloud logo library?`}
        confirmText="Remove Asset"
        variant="danger"
        onClose={() => setLogoToDelete(null)}
        onConfirm={() => {
          if (logoToDelete) {
            onDeleteLogo(logoToDelete.id);
            setLogoToDelete(null);
          }
        }}
      />
    </div>
  );
};
