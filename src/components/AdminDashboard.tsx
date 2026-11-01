import React, { useState } from 'react';
import { db } from '../services/db';
import type { AdSlotConfig, SponsorshipLead } from '../types';
import {
  Sliders,
  DollarSign,
  Users,
  CheckCircle2,
  Trash2,
  Save,
  Globe,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(() => db.getAdSlots());
  const [leads, setLeads] = useState<SponsorshipLead[]>(() => db.getLeads());
  const [activeTab, setActiveTab] = useState<'ads' | 'leads' | 'stats'>('ads');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Update AdSlot state
  const handleUpdateSlot = (id: string, updates: Partial<AdSlotConfig>) => {
    setAdSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot))
    );
  };

  const handleSaveAdSlots = () => {
    adSlots.forEach((slot) => {
      db.updateAdSlot(slot.id, slot);
    });
    setSavedNotification('AdSense ad slots updated successfully across the entire website!');
    setTimeout(() => setSavedNotification(null), 3000);
  };

  // Update Lead status
  const handleUpdateLeadStatus = (leadId: string, status: SponsorshipLead['status']) => {
    db.updateLeadStatus(leadId, status);
    setLeads(db.getLeads());
  };

  const handleDeleteLead = (leadId: string) => {
    db.deleteLead(leadId);
    setLeads(db.getLeads());
  };

  const allQRs = db.getAllQRs();
  const allUsers = db.getUsers();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
              Admin Control Panel
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              Strix QR Enterprise Administration
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure Google AdSense slots, review incoming sponsorships, and track platform metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live System Ready</span>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Platform QR Codes</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{allQRs.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Ad Slots</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {adSlots.filter((s) => s.enabled).length} / {adSlots.length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Corporate Sponsor Leads</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{leads.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Registered Users</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{allUsers.length}</p>
          </div>
        </div>
      </div>

      {savedNotification && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('ads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'ads'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Google AdSense Spaces ({adSlots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'leads'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Sponsorship Inquiries ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
            activeTab === 'stats'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & System</span>
        </button>
      </div>

      {/* TAB 1: ADSENSE SPACE MANAGER */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Ad Space Manager</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your Google AdSense Publisher ID and Slot IDs, or provide direct sponsor HTML tags.
              </p>
            </div>
            <button
              onClick={handleSaveAdSlots}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{slot.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">Dimensions: {slot.dimensions}</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={slot.enabled}
                      onChange={(e) => handleUpdateSlot(slot.id, { enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {slot.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{slot.description}</p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      Google AdSense Client ID (Publisher ID)
                    </label>
                    <input
                      type="text"
                      value={slot.adClient}
                      onChange={(e) => handleUpdateSlot(slot.id, { adClient: e.target.value })}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      Google AdSense Slot ID
                    </label>
                    <input
                      type="text"
                      value={slot.adSlot}
                      onChange={(e) => handleUpdateSlot(slot.id, { adSlot: e.target.value })}
                      placeholder="1234567890"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      Or Custom Sponsor HTML / Direct Banner Script
                    </label>
                    <textarea
                      rows={2}
                      value={slot.customHtml || ''}
                      onChange={(e) => handleUpdateSlot(slot.id, { customHtml: e.target.value })}
                      placeholder="<a href='https://sponsor.com'><img src='...' /></a>"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SPONSORSHIP INQUIRIES CRM */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Inbound Corporate Inquiries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Businesses from Chicago, NY, and Canada who submitted through the footer sponsorship form.
            </p>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">No sponsorship inquiries yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Company & Contact</th>
                    <th className="pb-3">Region & Tier</th>
                    <th className="pb-3">Message</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-slate-900 dark:text-white">{lead.company}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">{lead.name} • {lead.email}</div>
                        {lead.website && (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 text-[10px]"
                          >
                            <Globe className="w-3 h-3" />
                            <span>{lead.website}</span>
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 pr-3">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{lead.region}</div>
                        <div className="text-[11px] text-slate-400">{lead.tier}</div>
                      </td>

                      <td className="py-3.5 pr-3 max-w-xs text-slate-600 dark:text-slate-300 text-[11px]">
                        {lead.message}
                      </td>

                      <td className="py-3.5 pr-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-lg border text-xs font-semibold bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="contract_sent">Contract Sent</option>
                          <option value="closed">Closed Deal</option>
                        </select>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS & STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Platform User Directory</h3>
          <div className="space-y-3">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                  <span className="text-slate-400 ml-2 font-mono">({u.email})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                      u.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {u.role}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
