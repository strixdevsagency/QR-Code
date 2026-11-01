import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import type { SavedQRCode, SavedLogo } from '../types';
import { Trash2, ArrowUpRight, Upload, FolderKanban, Plus } from 'lucide-react';

interface UserDashboardProps {
  onLoadQRToGenerator: (qr: SavedQRCode) => void;
  onNavigateToGenerator: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onLoadQRToGenerator,
  onNavigateToGenerator,
}) => {
  const { user } = useAuth();
  const [qrs, setQrs] = useState<SavedQRCode[]>([]);
  const [logos, setLogos] = useState<SavedLogo[]>([]);
  const [activeTab, setActiveTab] = useState<'qrs' | 'logos'>('qrs');
  const [searchQuery, setSearchQuery] = useState('');

  const refreshData = () => {
    if (user) {
      setQrs(db.getUserQRs(user.id));
      setLogos(db.getUserLogos(user.id));
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleDeleteQR = (id: string) => {
    db.deleteQRCode(id);
    refreshData();
  };

  const handleDeleteLogo = (id: string) => {
    db.deleteLogo(id);
    refreshData();
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = () => {
        db.saveLogo(user.id, file.name, reader.result as string);
        refreshData();
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredQRs = qrs.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.qrType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDownloads = qrs.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Top Profile / Metrics Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              User Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Welcome, {user?.name || 'Valued User'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Permanent QR archive for {user?.email}. Your codes will never be deactivated.
            </p>
          </div>

          <button
            onClick={onNavigateToGenerator}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New QR</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saved Codes</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{qrs.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Downloads</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalDownloads}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Brand Assets</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{logos.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('qrs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'qrs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Saved QR Codes ({qrs.length})
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'logos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Brand Logos ({logos.length})
          </button>
        </div>

        {activeTab === 'qrs' && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved codes..."
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
          />
        )}
      </div>

      {/* TAB 1: SAVED QR CODES */}
      {activeTab === 'qrs' && (
        <div>
          {filteredQRs.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Saved QR Codes Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                When you generate a QR code, click "Save to Account" to store it permanently here.
              </p>
              <button
                onClick={onNavigateToGenerator}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
              >
                Create One Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQRs.map((qr) => (
                <div
                  key={qr.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-indigo-500/50 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {qr.qrType}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                      {qr.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 break-all">
                      {qr.payload}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onLoadQRToGenerator(qr)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>Load in Generator</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteQR(qr.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BRAND LOGOS */}
      {activeTab === 'logos' && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload your company logos to apply them with 1-click in the QR generator.
            </p>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Logo</span>
              <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
            </label>
          </div>

          {logos.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No logos saved yet. Upload your first brand logo above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {logos.map((lg) => (
                <div
                  key={lg.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative group"
                >
                  <button
                    onClick={() => handleDeleteLogo(lg.id)}
                    className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <img src={lg.url} alt={lg.name} className="w-12 h-12 object-contain my-2" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-full">
                    {lg.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
