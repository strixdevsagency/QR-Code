import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit3,
  Flame,
  Clock,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Wifi,
  Globe,
  UserCheck,
  FileText,
  ScanLine,
} from 'lucide-react';
import type { SavedQRCode } from '../../types';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/ConfirmModal';
import { MiniQRThumbnail } from './MiniQRThumbnail';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

interface SavedQRListProps {
  qrs: SavedQRCode[];
  onLoadQRToGenerator: (qr: SavedQRCode) => void;
  onDeleteQR: (id: string) => void;
  onOpenTestScan: (id: string) => void;
}

export const SavedQRList: React.FC<SavedQRListProps> = ({
  qrs,
  onLoadQRToGenerator,
  onDeleteQR,
  onOpenTestScan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'static' | 'dynamic' | 'wifi' | 'url'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'downloads' | 'scans'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [qrToDelete, setQrToDelete] = useState<{ id: string; title: string } | null>(null);

  // Filter & sort logic
  const filteredQRs = useMemo(() => {
    return qrs
      .filter((qr) => {
        // Search query filter
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          qr.title.toLowerCase().includes(query) ||
          qr.payload.toLowerCase().includes(query) ||
          qr.qrType.toLowerCase().includes(query) ||
          qr.id.toLowerCase().includes(query);

        if (!matchesQuery) return false;

        // Category filter
        if (selectedFilter === 'static') return !qr.isDynamic;
        if (selectedFilter === 'dynamic') return qr.isDynamic;
        if (selectedFilter === 'wifi') return qr.qrType === 'wifi';
        if (selectedFilter === 'url') return qr.qrType === 'url';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === 'downloads') return (b.downloadCount || 0) - (a.downloadCount || 0);
        if (sortBy === 'scans') {
          const aScans = a.dynamicConfig?.currentScans || 0;
          const bScans = b.dynamicConfig?.currentScans || 0;
          return bScans - aScans;
        }
        return 0;
      });
  }, [qrs, searchQuery, selectedFilter, sortBy]);

  const handleCopyPayload = (id: string, payload: string) => {
    playTactileClick();
    navigator.clipboard.writeText(payload);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickDownload = async (qr: SavedQRCode, format: 'png' | 'svg') => {
    playTactileClick();
    setDownloadingId(`${qr.id}-${format}`);

    try {
      // Dynamic creation of QR styling to generate immediate clean download
      const { default: QRCodeStyling } = await import('qr-code-styling');
      const qrInstance = new QRCodeStyling({
        width: 1000,
        height: 1000,
        type: 'canvas',
        data: qr.payload,
        image: qr.design.logoUrl || undefined,
        margin: qr.design.margin || 8,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: qr.design.logoUrl ? 'H' : 'Q',
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: qr.design.logoSize || 0.26,
          margin: 3,
          crossOrigin: 'anonymous',
        },
        dotsOptions: {
          type: qr.design.dotsType as any,
          color: qr.design.dotsColor,
          gradient: qr.design.isGradient && qr.design.dotsColorEnd
            ? {
                type: qr.design.gradientType,
                rotation: 0,
                colorStops: [
                  { offset: 0, color: qr.design.dotsColor },
                  { offset: 1, color: qr.design.dotsColorEnd },
                ],
              }
            : undefined,
        },
        cornersSquareOptions: {
          type: qr.design.cornerSquareType as any,
          color: qr.design.cornerSquareColor || qr.design.dotsColor,
        },
        cornersDotOptions: {
          type: qr.design.cornerDotType as any,
          color: qr.design.cornerDotColor || qr.design.dotsColor,
        },
        backgroundOptions: {
          color: qr.design.backgroundColor,
        },
      });

      const raw = await qrInstance.getRawData(format === 'svg' ? 'svg' : 'png');
      if (raw) {
        const blob = raw instanceof Blob ? raw : new Blob([raw as unknown as BlobPart]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${qr.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${qr.id}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        playVictoryFanfare();
      }
    } catch (e) {
      console.error('Quick download failed', e);
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (qr: SavedQRCode) => {
    if (!qr.isDynamic || !qr.dynamicConfig) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Permanent Static
        </span>
      );
    }

    const { mode, isBurned, currentScans, maxScans, expiresAt, isRevoked } = qr.dynamicConfig;

    if (isRevoked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-semibold border border-zinc-700">
          Revoked Token
        </span>
      );
    }

    if (isBurned || (mode === 'one_time' && currentScans >= (maxScans || 1))) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 text-[11px] font-semibold border border-rose-500/20">
          <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
          Burned ({currentScans}/{maxScans || 1} Scans)
        </span>
      );
    }

    if (mode === 'one_time') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold border border-amber-500/20">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Ready ({currentScans}/{maxScans || 1} Scans)
        </span>
      );
    }

    if (mode === 'time_limited' && expiresAt) {
      const isExpired = Date.now() > new Date(expiresAt).getTime();
      return isExpired ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-semibold border border-zinc-700">
          <Clock className="w-3 h-3 text-zinc-500" />
          Expired
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-semibold border border-cyan-500/20">
          <Clock className="w-3 h-3 text-cyan-400" />
          Active Ephemeral
        </span>
      );
    }

    return null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="w-3.5 h-3.5 text-blue-400" />;
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'vcard':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  if (qrs.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <ScanLine className="w-7 h-7 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Your Vault is Empty</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
          You haven&apos;t saved any permanent QR codes or dynamic tokens yet. Create your first code in the Studio to store it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Control Bar: Search, Category Filters, Sort, and View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vault by title, payload or token ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Category Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-950/80 rounded-xl border border-white/[0.08]">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'static', label: 'Static' },
                { id: 'dynamic', label: 'Dynamic' },
                { id: 'wifi', label: 'Wi-Fi' },
                { id: 'url', label: 'URL' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  playTactileClick();
                  setSelectedFilter(filter.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  selectedFilter === filter.id
                    ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              playTactileClick();
              setSortBy(e.target.value as any);
            }}
            className="px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs text-zinc-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-zinc-900 text-white">Newest First</option>
            <option value="oldest" className="bg-zinc-900 text-white">Oldest First</option>
            <option value="downloads" className="bg-zinc-900 text-white">Most Downloads</option>
            <option value="scans" className="bg-zinc-900 text-white">Most Scanned</option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="hidden sm:flex items-center p-0.5 bg-zinc-950/80 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => {
                playTactileClick();
                setViewMode('grid');
              }}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                playTactileClick();
                setViewMode('table');
              }}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Compact Table View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty Search State */}
      {filteredQRs.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-white/[0.08]">
          <p className="text-zinc-400 text-xs">No saved codes match your search query &quot;{searchQuery}&quot;.</p>
        </div>
      )}

      {/* Grid Mode (Modern Multi-Column Cards) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQRs.map((qr) => (
            <div
              key={qr.id}
              className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between gap-4 group shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/40"
            >
              {/* Card Top: Visual Thumbnail + Info */}
              <div className="flex items-start gap-4">
                {/* Visual QR Code Thumbnail */}
                <div className="relative group-hover:scale-105 transition-transform duration-200">
                  <MiniQRThumbnail
                    payload={qr.payload}
                    design={qr.design}
                    size={84}
                    className="p-1"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-md bg-zinc-900 border border-white/10 shadow-md">
                    {getTypeIcon(qr.qrType)}
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-blue-300 transition-colors">
                      {qr.title}
                    </h4>
                  </div>

                  <div>{getStatusBadge(qr)}</div>

                  <p className="text-[11px] text-zinc-400 font-mono truncate bg-zinc-950/60 px-2 py-1 rounded-lg border border-white/[0.04]">
                    {qr.payload}
                  </p>
                </div>
              </div>

              {/* Stats Footer Row */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-3">
                  <span>📥 <strong className="text-zinc-200">{qr.downloadCount || 0}</strong> downloads</span>
                  {qr.isDynamic && (
                    <span>⚡ <strong className="text-blue-400">{qr.dynamicConfig?.currentScans || 0}</strong> scans</span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(qr.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-1.5 pt-1">
                {/* 1-Click Copy Payload */}
                <button
                  type="button"
                  onClick={() => handleCopyPayload(qr.id, qr.payload)}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] text-[11px] font-medium flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  title="Copy encoded payload"
                >
                  {copiedId === qr.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* 1-Click Quick PNG */}
                <button
                  type="button"
                  onClick={() => handleQuickDownload(qr, 'png')}
                  disabled={downloadingId === `${qr.id}-png`}
                  className="py-1.5 px-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-[11px] font-medium flex items-center justify-center gap-1 transition active:scale-[0.98] cursor-pointer"
                  title="Direct Download High-Res PNG"
                >
                  <Download className="w-3 h-3" />
                  <span>PNG</span>
                </button>

                {/* 1-Click Quick SVG */}
                <button
                  type="button"
                  onClick={() => handleQuickDownload(qr, 'svg')}
                  disabled={downloadingId === `${qr.id}-svg`}
                  className="py-1.5 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 text-[11px] font-medium flex items-center justify-center gap-1 transition active:scale-[0.98] cursor-pointer"
                  title="Direct Download Vector SVG"
                >
                  <Download className="w-3 h-3" />
                  <span>SVG</span>
                </button>

                {/* Test Scan (if dynamic) */}
                {qr.isDynamic && (
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      onOpenTestScan(qr.id);
                    }}
                    className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                    title="Simulate Camera Scan"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                )}

                {/* Edit in Generator */}
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    onLoadQRToGenerator(qr);
                  }}
                  className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                  title="Edit in Generator Studio"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => {
                    playTactileClick();
                    setQrToDelete({ id: qr.id, title: qr.title });
                  }}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                  title="Delete from Vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table Mode (High-Density View) */
        <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 border-b border-white/[0.08] text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Matrix Preview</th>
                  <th className="py-3.5 px-4">Title & Payload</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Stats</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredQRs.map((qr) => (
                  <tr key={qr.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4">
                      <MiniQRThumbnail payload={qr.payload} design={qr.design} size={50} />
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-white truncate">{qr.title}</div>
                      <div className="text-[11px] font-mono text-zinc-400 truncate">{qr.payload}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(qr)}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      <div>📥 {qr.downloadCount || 0} downloads</div>
                      {qr.isDynamic && <div className="text-blue-400">⚡ {qr.dynamicConfig?.currentScans || 0} scans</div>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => onLoadQRToGenerator(qr)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickDownload(qr, 'png')}>
                          PNG
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            playTactileClick();
                            setQrToDelete({ id: qr.id, title: qr.title });
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!qrToDelete}
        title="Delete QR from Vault"
        message={`Are you sure you want to delete "${qrToDelete?.title}" from your cloud matrix vault? This action cannot be undone.`}
        confirmText="Delete QR"
        variant="danger"
        onClose={() => setQrToDelete(null)}
        onConfirm={() => {
          if (qrToDelete) {
            onDeleteQR(qrToDelete.id);
            setQrToDelete(null);
          }
        }}
      />
    </div>
  );
};
