import React, { useState, useMemo } from 'react';
import {
  Users,
  Building2,
  Mail,
  DollarSign,
  Calendar,
  Trash2,
  Plus,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../services/db';
import type { SponsorshipLead, SponsorStatus } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModal';
import { playTactileClick, playVictoryFanfare } from '../../utils/audioFeedback';

export const SponsorCRM: React.FC = () => {
  const [leads, setLeads] = useState<SponsorshipLead[]>(() => db.getLeads());
  const [statusFilter, setStatusFilter] = useState<'all' | SponsorStatus>('all');
  const [search, setSearch] = useState('');
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string; company: string } | null>(null);

  const refreshLeads = () => {
    setLeads(db.getLeads());
  };

  const handleUpdateStatus = (id: string, status: SponsorStatus) => {
    playTactileClick();
    db.updateLeadStatus(id, status);
    refreshLeads();
  };

  const handleDelete = (lead: SponsorshipLead) => {
    playTactileClick();
    setLeadToDelete({ id: lead.id, name: lead.name, company: lead.company });
  };

  // Manually log incoming partnership inquiry for pipeline tracking
  const handleAddSampleLead = () => {
    playTactileClick();
    const sampleCompanies = [
      { name: 'Marcus Vance', company: 'NovaCloud Systems', email: 'mvance@novacloud.io', tier: 'Imperial Gold ($1,500/mo)', region: 'North America', slot: 'Top Header Leaderboard (728x90)' },
      { name: 'Elena Rostova', company: 'Apex POS Terminal Group', email: 'elena@apexpos.com', tier: 'Royal Diamond ($2,400/mo)', region: 'Europe', slot: 'Preview Canvas Sticky Sidebar (300x250)' },
      { name: 'David Kim', company: 'Starlight Fintech', email: 'david@starlightpay.co', tier: 'Silver Infeed ($900/mo)', region: 'Asia-Pacific', slot: 'Download Interstitial Modal' },
    ];
    const picked = sampleCompanies[Math.floor(Math.random() * sampleCompanies.length)];

    db.saveLead({
      name: picked.name,
      company: picked.company,
      email: picked.email,
      website: `https://${picked.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      region: picked.region,
      tier: picked.tier,
      message: `Interested in quarterly banner sponsorship on ${picked.slot}. Budget allocation: ${picked.tier}.`,
    });
    refreshLeads();
    playVictoryFanfare();
  };

  // Pipeline metrics
  const pipelineStats = useMemo(() => {
    return {
      total: leads.length,
      newLeads: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      contractSent: leads.filter((l) => l.status === 'contract_sent').length,
      closed: leads.filter((l) => l.status === 'closed').length,
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.message || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      return true;
    });
  }, [leads, search, statusFilter]);

  const getStatusBadge = (status: SponsorStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold text-[11px]">
            ● New Inquiry
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold text-[11px]">
            In Discussion
          </span>
        );
      case 'contract_sent':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold text-[11px]">
            Contract Sent
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
            ✓ Closed Partner
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-pop-in">
      {/* Header & Pipeline Metrics Deck */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] font-semibold mb-1">
              <Users className="w-3.5 h-3.5" />
              B2B Corporate Partnerships
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Sponsorship Leads & Revenue Pipeline CRM
            </h3>
            <p className="text-xs text-zinc-400">
              Manage prospective direct advertisers, contract progression, and slot reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSampleLead}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-[0.98] shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Inbound Lead</span>
          </button>
        </div>

        {/* 4 Pipeline Stage Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-blue-400 font-mono font-semibold uppercase">New Inquiries</span>
            <div className="text-xl font-bold text-white">{pipelineStats.newLeads}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-amber-400 font-mono font-semibold uppercase">In Contact</span>
            <div className="text-xl font-bold text-white">{pipelineStats.contacted}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-purple-400 font-mono font-semibold uppercase">Contract Sent</span>
            <div className="text-xl font-bold text-white">{pipelineStats.contractSent}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">Closed Won</span>
            <div className="text-xl font-bold text-white">{pipelineStats.closed}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads by company, contact person, email or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/80 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-950/80 rounded-xl border border-white/[0.08] overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'new', label: 'New' },
              { id: 'contacted', label: 'Contacted' },
              { id: 'contract_sent', label: 'Contracts' },
              { id: 'closed', label: 'Closed' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playTactileClick();
                setStatusFilter(t.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                statusFilter === t.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Cards Grid */}
      {filteredLeads.length === 0 ? (
        <div className="p-14 text-center rounded-2xl bg-zinc-900/40 border border-white/[0.08] space-y-3">
          <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Sponsorship Leads in This View</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Click &quot;Generate Test Lead&quot; above to simulate inbound advertiser submissions from the public site.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="p-5 rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-white/[0.08] hover:border-white/[0.18] transition flex flex-col justify-between gap-4 shadow-lg shadow-black/20"
            >
              {/* Top Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-white block">{lead.name}</span>
                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {lead.company}
                    </span>
                  </div>

                  <div>{getStatusBadge(lead.status)}</div>
                </div>

                {/* Email & Date */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                  <a
                    href={`mailto:${lead.email}`}
                    className="hover:text-white transition flex items-center gap-1 text-zinc-300"
                  >
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    {lead.email}
                  </a>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Tier and Region */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                    {lead.tier}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                    {lead.region}
                  </span>
                </div>

                {/* Message & Inquiry Details */}
                {lead.message && (
                  <p className="text-xs text-zinc-300 bg-zinc-950/70 p-3 rounded-xl border border-white/[0.04] leading-relaxed">
                    &ldquo;{lead.message}&rdquo;
                  </p>
                )}
              </div>

              {/* Status Switcher & Delete */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Stage:</span>
                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value as SponsorStatus)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-white/[0.1] text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="new" className="bg-zinc-900 text-white">● New Inquiry</option>
                    <option value="contacted" className="bg-zinc-900 text-white">In Discussion</option>
                    <option value="contract_sent" className="bg-zinc-900 text-white">Contract Sent</option>
                    <option value="closed" className="bg-zinc-900 text-white">✓ Closed Won</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(lead)}
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                  title="Delete Lead"
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
        isOpen={!!leadToDelete}
        title="Delete Partnership Lead"
        message={`Delete corporate sponsorship lead for "${leadToDelete?.name}" (${leadToDelete?.company})?`}
        confirmText="Delete Lead"
        variant="danger"
        onClose={() => setLeadToDelete(null)}
        onConfirm={() => {
          if (leadToDelete) {
            db.deleteLead(leadToDelete.id);
            refreshLeads();
            setLeadToDelete(null);
          }
        }}
      />
    </div>
  );
};
