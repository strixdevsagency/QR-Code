import React, { useState } from 'react';
import { db } from '../../services/db';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';

export const SponsorSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
    region: 'Worldwide / Global',
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
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1.5">
            Corporate Partnerships
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Partner & Sponsor with StrixDevs
          </h2>
          <p className="text-slate-400 mt-2 text-xs sm:text-sm">
            Reach thousands of business owners, restaurateurs, and agencies generating and printing high-res QR codes worldwide.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <span className="text-2xl text-emerald-400 block font-bold">✓</span>
            <h3 className="text-lg font-bold text-white">Inquiry Received by StrixDevs</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Our enterprise partnerships team will review your placement request and reach out at <strong>{formData.email}</strong> within 1 business day.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium pt-2 cursor-pointer"
            >
              Submit another inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="Alex Vance"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Company / Brand"
                required
                placeholder="Apex POS Solutions"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Email"
                type="email"
                required
                placeholder="alex@apexpos.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Company Website"
                type="url"
                placeholder="https://apexpos.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300">Geographic Market</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Worldwide / Global">Worldwide / Global</option>
                  <option value="North America">North America</option>
                  <option value="Europe & UK">Europe & United Kingdom</option>
                  <option value="Asia-Pacific">Asia-Pacific</option>
                  <option value="Latin America">Latin America</option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300">Sponsorship Placement</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090d16] border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="Top Leaderboard Banner Sponsor">Top Leaderboard Banner Sponsor</option>
                  <option value="Sidebar Sticky Partner">Sticky Preview Sidebar Placement</option>
                  <option value="Print Template Feature">Print Template Exclusive Partner</option>
                  <option value="StrixDevs Custom Tech Collab">Custom Agency Collaboration</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Objectives & Message"
              rows={3}
              required
              placeholder="Tell us about your brand, preferred duration, and sponsorship goals..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />

            <Button type="submit" variant="primary" fullWidth size="lg">
              Submit Sponsorship Inquiry
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};
