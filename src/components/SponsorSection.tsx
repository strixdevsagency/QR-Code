import React, { useState } from 'react';
import { db } from '../services/db';
import { Building2, Send, CheckCircle2 } from 'lucide-react';

export const SponsorSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
    region: 'Chicago & Midwest Area',
    tier: 'Top Leaderboard Banner Sponsor',
    message: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;

    db.saveLead({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      website: formData.website,
      region: formData.region,
      tier: formData.tier,
      message: formData.message,
    });

    setSubmitted(true);
  };

  return (
    <section id="sponsor-section" className="my-16 max-w-4xl mx-auto px-4 scroll-mt-24">
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Direct Corporate Sponsorships
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Partner & Sponsor with StrixDevs
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mt-2 text-xs sm:text-sm">
            Put your brand in front of thousands of active business owners, restaurateurs, and entrepreneurs across Chicago, New York, Canada, and beyond.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Sponsorship Inquiry Received!</h3>
            <p className="text-xs text-slate-300 mt-2">
              Thank you, <strong className="text-emerald-400">{formData.name}</strong> from <strong className="text-emerald-400">{formData.company}</strong>. The StrixDevs corporate partnerships team will contact you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              Submit another inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Miller"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Apex POS Solutions"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@apexpos.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Business Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://apexpos.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Geographic Market</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Chicago & Midwest Area">Chicago & Midwest Area</option>
                  <option value="New York & Tri-State Area">New York & Tri-State Area</option>
                  <option value="Canada (Toronto, Vancouver, Montreal)">Canada (Toronto, Vancouver, Montreal)</option>
                  <option value="North America Wide">North America Wide (US & Canada)</option>
                  <option value="Global">Worldwide / Global</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sponsorship Placement</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Top Leaderboard Banner Sponsor">Top Leaderboard Banner Sponsor</option>
                  <option value="Sidebar Sticky Partner">Sticky Preview Sidebar Placement</option>
                  <option value="Print Template Feature">Print Template Exclusive Partner</option>
                  <option value="StrixDevs Custom Tech Collab">Custom Agency Collaboration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Campaign Objectives / Message</label>
              <textarea
                rows={3}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your brand, preferred duration, and sponsorship goals..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-90 text-white font-semibold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Sponsorship Inquiry to StrixDevs</span>
            </button>

            <p className="text-[11px] text-center text-slate-500 mt-2">
              Direct inquiries can also be sent to <a href="mailto:sponsorships@strixdevs.com" className="text-indigo-400 underline">sponsorships@strixdevs.com</a>
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
