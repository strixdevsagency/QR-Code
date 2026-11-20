import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { db } from '../../services/db';
import { PricingPlan } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const PackageManager: React.FC = () => {
  const [packages, setPackages] = useState<PricingPlan[]>(() => db.getPackages());
  const [editingPkg, setEditingPkg] = useState<PricingPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const refreshPackages = () => {
    setPackages(db.getPackages());
  };

  const handleStartCreate = () => {
    playTactileClick();
    const newId = `plan_${Date.now()}`;
    const newPlan: PricingPlan = {
      id: newId,
      name: 'Custom Team Plan',
      tagline: 'Tailored for team deployments and high-volume operations',
      priceMonthly: 19,
      priceAnnual: 15,
      annualBilledTotal: 169,
      highlighted: false,
      popularBadge: 'Custom',
      ctaLabel: 'Choose Custom',
      isActive: true,
      sortOrder: packages.length + 1,
      features: [
        'Everything in Pro tier',
        'Custom team redemption keys with multi-seat sharing',
        'Dedicated QR asset repository',
      ],
      limits: {
        dynamicQRs: 'unlimited',
        monthlyScans: 'unlimited',
        bulkGeneration: true,
        customLogos: 'unlimited',
        vectorPdf: true,
        smartRouting: true,
        analytics: 'advanced',
        adFree: true,
      },
    };
    setEditingPkg(newPlan);
    setIsCreating(true);
  };

  const handleEdit = (pkg: PricingPlan) => {
    playTactileClick();
    setEditingPkg(JSON.parse(JSON.stringify(pkg)));
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg || !editingPkg.name.trim()) return;

    db.savePackage(editingPkg);
    playVictoryFanfare();
    refreshPackages();
    setEditingPkg(null);
    setIsCreating(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (id === 'free' || id === 'pro') {
      alert('The core Free and Pro starter tiers cannot be deleted. You may disable them or edit their limits.');
      return;
    }
    if (confirm('Are you sure you want to delete this package?')) {
      playTactileClick();
      db.deletePackage(id);
      refreshPackages();
    }
  };

  const handleToggleActive = (pkg: PricingPlan) => {
    playTactileClick();
    const updated = { ...pkg, isActive: pkg.isActive === false ? true : false };
    db.savePackage(updated);
    refreshPackages();
  };

  const handleAddFeature = () => {
    if (!featureInput.trim() || !editingPkg) return;
    setEditingPkg({
      ...editingPkg,
      features: [...editingPkg.features, featureInput.trim()],
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!editingPkg) return;
    setEditingPkg({
      ...editingPkg,
      features: editingPkg.features.filter((_, i) => i !== idx),
    });
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all packages to the official Strix QR default plans? Any custom plans will be replaced.')) {
      playTactileClick();
      db.resetPackagesToDefault();
      refreshPackages();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              Package & Pricing Matrix Manager
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Configure consumer, pro, and custom agency plans. Edits instantly reflect on the public pricing modal and checkout request flows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 font-bold cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Package</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-pop-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Package configuration successfully saved and synchronized!</span>
        </div>
      )}

      {/* Package Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => {
          const isActive = pkg.isActive !== false;
          return (
            <div
              key={pkg.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 relative ${
                pkg.highlighted
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-indigo-500/40 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : 'bg-zinc-900/60 border-white/[0.08] hover:border-white/15'
              } ${!isActive ? 'opacity-60' : ''}`}
            >
              {pkg.popularBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                  {pkg.popularBadge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {pkg.name}
                    {!isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-white/10">
                        Inactive
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(pkg)}
                      title={isActive ? 'Deactivate Plan' : 'Activate Plan'}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    >
                      {isActive ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(pkg)}
                      title="Edit Package"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    {pkg.id !== 'free' && pkg.id !== 'pro' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg.id)}
                        title="Delete Package"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 min-h-[32px] leading-relaxed mb-4">
                  {pkg.tagline}
                </p>

                <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/[0.06] mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-white">
                      ${pkg.priceMonthly}
                    </span>
                    <span className="text-xs text-zinc-400">/ mo</span>
                    <span className="text-xs text-zinc-500 mx-1">•</span>
                    <span className="text-xs font-semibold text-indigo-400">
                      ${pkg.annualBilledTotal > 0 ? `${pkg.annualBilledTotal}/yr` : 'Free'}
                    </span>
                  </div>
                  {pkg.priceAnnual > 0 && (
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      (${pkg.priceAnnual}/mo when billed annually)
                    </div>
                  )}
                </div>

                {/* Features list */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-1">
                    Features ({pkg.features.length})
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {pkg.features.slice(0, 5).map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </li>
                    ))}
                    {pkg.features.length > 5 && (
                      <li className="text-[11px] text-zinc-500 pl-4">
                        +{pkg.features.length - 5} more features...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                <span>Dynamic QRs: <strong className="text-white">{String(pkg.limits.dynamicQRs)}</strong></span>
                <span>Bulk: <strong className="text-white">{pkg.limits.bulkGeneration ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Editor Modal / Drawer */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-white/[0.1] rounded-3xl p-6 sm:p-7 shadow-2xl relative my-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-indigo-400" />
                  {isCreating ? 'Create Custom Package' : `Edit Package: ${editingPkg.name}`}
                </h3>
                <p className="text-xs text-zinc-400">
                  Update plan pricing, team features, and studio access limits.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Package Name"
                  required
                  placeholder="e.g. Strix Team Plus"
                  value={editingPkg.name}
                  onChange={(e) => setEditingPkg({ ...editingPkg, name: e.target.value })}
                />
                <Input
                  label="Unique Identifier / ID"
                  required
                  disabled={editingPkg.id === 'free' || editingPkg.id === 'pro' || editingPkg.id === 'enterprise'}
                  placeholder="e.g. team_pro"
                  value={editingPkg.id}
                  onChange={(e) => setEditingPkg({ ...editingPkg, id: e.target.value })}
                />
              </div>

              <Input
                label="Tagline / Short Summary"
                placeholder="For teams, fast-growing brands, and marketing departments"
                value={editingPkg.tagline}
                onChange={(e) => setEditingPkg({ ...editingPkg, tagline: e.target.value })}
              />

              {/* Pricing Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Monthly Price ($)"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={String(editingPkg.priceMonthly)}
                  onChange={(e) => setEditingPkg({ ...editingPkg, priceMonthly: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Annual Monthly Equiv ($)"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={String(editingPkg.priceAnnual)}
                  onChange={(e) => setEditingPkg({ ...editingPkg, priceAnnual: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Annual Billed Total ($)"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={String(editingPkg.annualBilledTotal)}
                  onChange={(e) => setEditingPkg({ ...editingPkg, annualBilledTotal: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {/* Badges & Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Header Badge (Optional)"
                  placeholder="e.g. Most Popular, High Volume"
                  value={editingPkg.popularBadge || ''}
                  onChange={(e) => setEditingPkg({ ...editingPkg, popularBadge: e.target.value || undefined })}
                />
                <Input
                  label="Button CTA Label"
                  placeholder="e.g. Upgrade to Pro"
                  value={editingPkg.ctaLabel}
                  onChange={(e) => setEditingPkg({ ...editingPkg, ctaLabel: e.target.value })}
                />
              </div>

              {/* Highlighted & Active switches */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={editingPkg.highlighted || false}
                    onChange={(e) => setEditingPkg({ ...editingPkg, highlighted: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Highlight as Featured / Most Popular Card</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={editingPkg.isActive !== false}
                    onChange={(e) => setEditingPkg({ ...editingPkg, isActive: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Active & Available for Purchase</span>
                </label>
              </div>

              {/* Features Editor */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Package Features Included
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new feature bullet point..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
                  {editingPkg.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-900 border border-white/[0.04] text-xs text-zinc-300"
                    >
                      <span className="flex-1">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="font-bold cursor-pointer"
                >
                  Save Package Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
