import React, { useState } from 'react';
import {
  ShoppingBag,
  Mail,
  Phone,
  Key,
  Users,
  Trash2,
  Search,
} from 'lucide-react';
import { db } from '../../services/db';
import { PackageOrder, PackageOrderStatus, UserTier } from '../../types';
import { Button } from '../ui/Button';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const PackageOrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<PackageOrder[]>(() => db.getPackageOrders());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshOrders = () => {
    setOrders(db.getPackageOrders());
  };

  const handleCopyCode = (id: string, code: string) => {
    playTactileClick();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = (id: string, status: PackageOrderStatus) => {
    playTactileClick();
    db.updatePackageOrderStatus(id, status);
    refreshOrders();
  };

  const handleQuickIssueCode = (order: PackageOrder) => {
    playTactileClick();
    const isTeam = (order.teamSeats || 1) > 1;
    const tier: UserTier = order.planId === 'enterprise' ? 'enterprise' : 'pro';
    const prefix = isTeam ? 'STRIX-TEAM' : tier === 'enterprise' ? 'STRIX-ENT' : 'STRIX-PRO';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const generatedCode = `${prefix}-${rand}`;

    // Create the license code in vault
    db.createLicenseCode({
      code: generatedCode,
      tier,
      maxUses: isTeam ? (order.teamSeats || 5) : 1,
      customerName: order.name,
      customerEmail: order.email,
      notes: `Order #${order.id} | ${order.planName} (${order.interval})`,
      isActive: true,
      expiresAt: null,
    });

    // Update order status with issued code
    db.updatePackageOrderStatus(order.id, 'code_issued', generatedCode);
    playVictoryFanfare();
    refreshOrders();
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Delete this order inquiry?')) {
      playTactileClick();
      db.deletePackageOrder(id);
      refreshOrders();
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.planName.toLowerCase().includes(q) ||
      (o.notes && o.notes.toLowerCase().includes(q)) ||
      (o.issuedCode && o.issuedCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              Package Purchase Requests & Order CRM
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Inbound Orders
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Review inbound user subscription requests. One-click issue license codes (single-user or multi-seat team packages) to activate their account.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/[0.06] text-center text-xs text-zinc-400">
            No customer order requests found. When users submit the subscription form, inquiries appear here.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const isTeam = (ord.teamSeats || 1) > 1;

            return (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-zinc-900/80 border border-white/[0.08] hover:border-white/15 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{ord.name}</h3>
                    <span className="text-xs text-zinc-400">•</span>
                    <span className="text-xs font-semibold text-blue-400">{ord.planName}</span>
                    <span className="text-[11px] text-zinc-400">({ord.interval})</span>
                    <span className="text-xs font-bold text-emerald-400">{ord.priceFormatted}</span>

                    {isTeam && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Users className="w-2.5 h-2.5" />
                        Team: {ord.teamSeats} Seats
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        ord.status === 'code_issued'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.status === 'contacted'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : ord.status === 'completed'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <a href={`mailto:${ord.email}`} className="text-blue-400 hover:underline">{ord.email}</a>
                    </span>
                    {ord.phoneOrWhatsapp && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-zinc-200">{ord.phoneOrWhatsapp}</span>
                      </span>
                    )}
                    <span className="text-zinc-500">
                      Received {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {ord.notes && (
                    <div className="text-xs text-zinc-300 p-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.04]">
                      <span className="text-zinc-500 font-semibold block text-[10px] uppercase mb-0.5">Customer Note:</span>
                      {ord.notes}
                    </div>
                  )}

                  {/* Issued code display if already generated */}
                  {ord.issuedCode && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                      <Key className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-zinc-300">Issued Code:</span>
                      <strong className="font-mono text-emerald-400">{ord.issuedCode}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(ord.id, ord.issuedCode!)}
                        className="ml-auto px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold cursor-pointer"
                      >
                        {copiedId === ord.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Actions & Status Control */}
                <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
                  {!ord.issuedCode && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickIssueCode(ord)}
                      className="font-bold cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 text-xs"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Issue {isTeam ? `${ord.teamSeats}-Seat Team Code` : 'Activation Code'}</span>
                    </Button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value as PackageOrderStatus)}
                      className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-white/10 text-xs text-zinc-300 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="code_issued">Code Issued</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(ord.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
