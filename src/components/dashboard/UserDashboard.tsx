import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import type { SavedQRCode, SavedLogo } from '../../types';
import { SavedQRList } from './SavedQRList';
import { LogoLibrary } from './LogoLibrary';
import { Button } from '../ui/Button';

interface UserDashboardProps {
  onLoadQRToGenerator: (qr: SavedQRCode) => void;
  onNavigateToGenerator: () => void;
  onOpenTestScan: (codeId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onLoadQRToGenerator,
  onNavigateToGenerator,
  onOpenTestScan,
}) => {
  const { user } = useAuth();
  const [qrs, setQrs] = useState<SavedQRCode[]>([]);
  const [logos, setLogos] = useState<SavedLogo[]>([]);
  const [tab, setTab] = useState<'qrs' | 'logos'>('qrs');

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Verified User Vault
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Welcome, {user?.name || 'Partner'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Permanent static & dynamic QR code records for {user?.email}.
          </p>
        </div>

        <Button variant="primary" onClick={onNavigateToGenerator}>
          + Create New QR
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('qrs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            tab === 'qrs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Saved Codes ({qrs.length})
        </button>
        <button
          onClick={() => setTab('logos')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            tab === 'logos'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Brand Logos ({logos.length})
        </button>
      </div>

      {/* Tab Panels */}
      {tab === 'qrs' ? (
        <SavedQRList
          qrs={qrs}
          onLoadQRToGenerator={onLoadQRToGenerator}
          onDeleteQR={handleDeleteQR}
          onOpenTestScan={onOpenTestScan}
        />
      ) : (
        <LogoLibrary
          logos={logos}
          onUploadLogo={handleUploadLogo}
          onDeleteLogo={handleDeleteLogo}
        />
      )}
    </div>
  );
};

