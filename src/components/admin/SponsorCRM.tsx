import React, { useState } from 'react';
import { db } from '../../services/db';
import type { SponsorshipLead, SponsorStatus } from '../../types';
import { Button } from '../ui/Button';

export const SponsorCRM: React.FC = () => {
  const [leads, setLeads] = useState<SponsorshipLead[]>(() => db.getLeads());

  const handleUpdateStatus = (id: string, status: SponsorStatus) => {
    db.updateLeadStatus(id, status);
    setLeads(db.getLeads());
  };

  const handleDelete = (id: string) => {
    db.deleteLead(id);
    setLeads(db.getLeads());
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
      <div>
        <h3 className="text-base font-bold text-white tracking-tight">
          B2B Corporate Sponsorship Leads CRM
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Review and advance inquiries submitted from the website's corporate partnership form.
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">No sponsor leads received yet.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-white">{lead.name}</span>
                  <span className="text-slate-400 ml-2">from <strong className="text-indigo-400">{lead.company}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value as SponsorStatus)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="new">Status: New</option>
                    <option value="contacted">Status: Contacted</option>
                    <option value="contract_sent">Status: Contract Sent</option>
                    <option value="closed">Status: Closed</option>
                  </select>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(lead.id)}>
                    ✕
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                <a href={`mailto:${lead.email}`} className="text-indigo-400 underline">{lead.email}</a>
                {lead.website && <span>• <a href={lead.website} target="_blank" rel="noreferrer" className="underline">{lead.website}</a></span>}
                <span>• Region: {lead.region}</span>
                <span>• Tier: {lead.tier}</span>
              </div>

              <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                "{lead.message}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

