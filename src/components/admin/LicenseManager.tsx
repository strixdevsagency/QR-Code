import React, { useState } from 'react';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Users,
  Shield,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { db } from '../../services/db';
import { LicenseCode, UserTier, LicenseDuration } from '../../types';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { ConfirmModal } from '../ui/ConfirmModal';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const LicenseManager: React.FC = () => {
  const [codes, setCodes] = useState<LicenseCode[]>(() => db.getLicenseCodes());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);

  // New code form state
  const [formData, setFormData] = useState({
    code: '',
    tier: 'pro' as UserTier,
    duration: '1_month' as LicenseDuration,
    durationDays: 30,
    isTeam: false,
    teamSeats: 5,
    customerName: '',
    customerEmail: '',
    notes: '',
    expiresInDays: 0, // 0 = code voucher never expires
  });

  const refreshCodes = () => {
    setCodes(db.getLicenseCodes());
  };

  const handleCopyCode = (id: string, code: string) => {
    playTactileClick();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateRandomCode = (tier: UserTier, isTeam: boolean) => {
    playTactileClick();
    const prefix = isTeam ? 'STRIX-TEAM' : tier === 'enterprise' ? 'STRIX-ENT' : 'STRIX-PRO';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, code: `${prefix}-${rand}` }));
  };

  const handleOpenCreateModal = (
    initialTier?: UserTier,
    initialEmail?: string,
    initialName?: string,
    initialSeats?: number,
    initialDuration?: LicenseDuration,
    initialDurationDays?: number
  ) => {
    playTactileClick();
    const tier = initialTier || 'pro';
    const isTeam = (initialSeats || 1) > 1;
    const prefix = isTeam ? 'STRIX-TEAM' : tier === 'enterprise' ? 'STRIX-ENT' : 'STRIX-PRO';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const durationDays = initialDurationDays !== undefined ? initialDurationDays : initialDuration === '1_year' ? 365 : initialDuration === '7_days' ? 7 : initialDuration === 'lifetime' ? 0 : 30;

    setFormData({
      code: `${prefix}-${rand}`,
      tier,
      duration: initialDuration || '1_month',
      durationDays,
      isTeam,
      teamSeats: initialSeats || 5,
      customerName: initialName || '',
      customerEmail: initialEmail || '',
      notes: '',
      expiresInDays: 0,
    });
    setIsModalOpen(true);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    let expiresAt: string | null = null;
    if (formData.expiresInDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + formData.expiresInDays);
      expiresAt = d.toISOString();
    }

    const maxUses = formData.isTeam ? Math.max(2, formData.teamSeats) : 1;

    db.createLicenseCode({
      code: formData.code.trim().toUpperCase(),
      tier: formData.tier,
      duration: formData.duration,
      durationDays: formData.durationDays,
      maxUses,
      customerName: formData.customerName.trim() || undefined,
      customerEmail: formData.customerEmail.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isActive: true,
      expiresAt,
    });

    playVictoryFanfare();
    refreshCodes();
    setIsModalOpen(false);
  };

  const handleToggleActive = (code: LicenseCode) => {
    playTactileClick();
    db.updateLicenseCode(code.id, { isActive: !code.isActive });
    refreshCodes();
  };

  const handleDeleteCode = (id: string) => {
    playTactileClick();
    setCodeToDelete(id);
  };

  const filteredCodes = codes.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(q)) ||
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-400" />
              Redemption Codes & Team License Vault
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Multi-Seat Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Issue single-use activation vouchers or multi-seat team access keys for organizations. Users redeem keys instantly without entering credit card details.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleOpenCreateModal('pro')}
            className="flex items-center gap-1.5 font-bold cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Code</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-white/[0.06]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span>Showing <strong className="text-white">{filteredCodes.length}</strong> of {codes.length} active codes</span>
        </div>
      </div>

      {/* Codes Table / Cards */}
      <div className="space-y-3">
        {filteredCodes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/[0.06] text-center text-xs text-zinc-400">
            No license codes found matching your query. Click &quot;Generate New Code&quot; to create one.
          </div>
        ) : (
          filteredCodes.map((codeItem) => {
            const isTeam = codeItem.maxUses > 1;
            const percentUsed = Math.min(100, Math.round((codeItem.usedCount / codeItem.maxUses) * 100));
            const isExpired = codeItem.expiresAt && new Date(codeItem.expiresAt).getTime() < Date.now();
            const isFullyClaimed = codeItem.usedCount >= codeItem.maxUses;

            return (
              <div
                key={codeItem.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !codeItem.isActive
                    ? 'bg-zinc-950/40 border-zinc-800 opacity-60'
                    : isFullyClaimed
                    ? 'bg-zinc-900/40 border-white/[0.06]'
                    : 'bg-zinc-900/80 border-white/[0.08] hover:border-white/15'
                }`}
              >
                {/* Code & Meta */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/[0.1] select-all">
                      {codeItem.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeItem.id, codeItem.code)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      {copiedId === codeItem.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        codeItem.tier === 'enterprise'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {codeItem.tier.toUpperCase()} TIER
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isTeam
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-white/[0.06]'
                      }`}
                    >
                      {isTeam && <Users className="w-2.5 h-2.5" />}
                      {isTeam ? `Team (${codeItem.maxUses} Seats)` : 'Single Use (1 Seat)'}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-white/10 flex items-center gap-1 font-medium">
                      <Clock className="w-2.5 h-2.5 text-[#38bdf8]" />
                      {codeItem.durationDays === 0 || codeItem.duration === 'lifetime'
                        ? 'Lifetime'
                        : codeItem.durationDays === 7 || codeItem.duration === '7_days'
                        ? '7 Days'
                        : codeItem.durationDays === 365 || codeItem.duration === '1_year'
                        ? '1 Year'
                        : `${codeItem.durationDays || 30} Days`}
                    </span>

                    {!codeItem.isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                        Deactivated
                      </span>
                    )}

                    {isExpired && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        Expired
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                    {codeItem.customerName && (
                      <span>Recipient: <strong className="text-zinc-200">{codeItem.customerName}</strong></span>
                    )}
                    {codeItem.customerEmail && (
                      <span>(<a href={`mailto:${codeItem.customerEmail}`} className="text-blue-400 hover:underline">{codeItem.customerEmail}</a>)</span>
                    )}
                    {codeItem.notes && (
                      <span className="text-zinc-400 italic">• &quot;{codeItem.notes}&quot;</span>
                    )}
                  </div>
                </div>

                {/* Usage Progress & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                  <div className="w-full sm:w-44 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Claimed:</span>
                      <span className="font-mono font-semibold text-white">
                        {codeItem.usedCount} / {codeItem.maxUses === 9999 ? '∞' : codeItem.maxUses} seats
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden border border-white/[0.06]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFullyClaimed ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(codeItem)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                      title={codeItem.isActive ? 'Deactivate this code' : 'Reactivate this code'}
                    >
                      {codeItem.isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCode(codeItem.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Code Generation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-lg bg-zinc-900 border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  Issue New License / Team Voucher
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure usage limits, seat quota, and target customer email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-4">
              {/* Plan Tier */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Package Tier to Grant
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, tier: 'pro' }));
                      handleGenerateRandomCode('pro', formData.isTeam);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      formData.tier === 'pro'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/20'
                        : 'bg-zinc-950 border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Strix Pro Tier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, tier: 'enterprise' }));
                      handleGenerateRandomCode('enterprise', formData.isTeam);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      formData.tier === 'enterprise'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-600/20'
                        : 'bg-zinc-950 border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Enterprise Tier</span>
                  </button>
                </div>
              </div>

              {/* Access Duration / Session Validity */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Subscription Validity Period (Session Duration)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '7_days', label: '7 Days', desc: 'Short Trial', days: 7 },
                    { id: '1_month', label: '1 Month', desc: '30 Days Standard', days: 30 },
                    { id: '1_year', label: '1 Year', desc: '365 Days Annual', days: 365 },
                    { id: 'lifetime', label: 'Lifetime', desc: 'Permanent', days: 0 },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          duration: dur.id as LicenseDuration,
                          durationDays: dur.days,
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        formData.durationDays === dur.days
                          ? 'bg-[#38bdf8]/15 border-[#38bdf8]/40 text-[#38bdf8] shadow-md shadow-[#38bdf8]/10'
                          : 'bg-zinc-950 border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${formData.durationDays === dur.days ? 'text-[#38bdf8]' : 'text-zinc-500'}`} />
                        <span>{dur.label}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{dur.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Single Use vs Team Seat Toggle */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Team Multi-Seat License
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Can multiple colleagues redeem this identical code?
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isTeam}
                    onChange={(e) => {
                      const isTeam = e.target.checked;
                      setFormData((prev) => ({ ...prev, isTeam }));
                      handleGenerateRandomCode(formData.tier, isTeam);
                    }}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500"
                  />
                </div>

                {formData.isTeam && (
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3 animate-pop-in">
                    <span className="text-xs text-zinc-300 font-medium">Number of Team Seats:</span>
                    <div className="flex items-center gap-1">
                      {[3, 5, 10, 25].map((seats) => (
                        <button
                          key={seats}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, teamSeats: seats }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                            formData.teamSeats === seats
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {seats}
                        </button>
                      ))}
                      <input
                        type="number"
                        min="2"
                        max="1000"
                        value={formData.teamSeats}
                        onChange={(e) => setFormData((prev) => ({ ...prev, teamSeats: parseInt(e.target.value) || 2 }))}
                        className="w-16 px-2 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white text-center font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Code String with Regenerate Button */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  License Code String
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    placeholder="e.g. STRIX-PRO-9841"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="font-mono font-bold tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerateRandomCode(formData.tier, formData.isTeam)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    Randomize
                  </button>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Customer / Company Name"
                  placeholder="Acme Corp or Sarah J."
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
                <Input
                  label="Customer Email (Optional)"
                  type="email"
                  placeholder="billing@customer.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>

              <Input
                label="Admin Order Reference / Notes"
                placeholder="e.g. Paid via PayPal Invoice #8849"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="font-bold cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                >
                  Create & Save Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Code Confirmation Modal */}
      <ConfirmModal
        isOpen={!!codeToDelete}
        onClose={() => setCodeToDelete(null)}
        onConfirm={() => {
          if (codeToDelete) {
            db.deleteLicenseCode(codeToDelete);
            refreshCodes();
            setCodeToDelete(null);
          }
        }}
        title="Delete License Key"
        message="Are you sure you want to permanently delete this license code? Any unredeemed vouchers with this key will become invalid."
        confirmLabel="Delete Code"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
};
