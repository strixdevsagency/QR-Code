import React, { useState } from 'react';
import { db } from '../services/db';
import { Sparkles, ArrowUpRight, X, Check, Building2 } from 'lucide-react';

interface SponsorMarqueeProps {
  onOpenSponsorModal?: () => void;
}

export const SponsorMarquee: React.FC<SponsorMarqueeProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    website: '',
    region: 'North America Wide',
    message: '',
  });

  const sponsors = [
    { name: 'Apex POS Solutions', category: 'Retail POS', location: 'Chicago, IL' },
    { name: 'Manhattan Commercial Print', category: 'Print Services', location: 'New York, NY' },
    { name: 'TriState Cloud Network', category: 'Infrastructure', location: 'USA / Canada' },
    { name: 'Great Lakes Roasters', category: 'Hospitality', location: 'Chicago, IL' },
    { name: 'Toronto Retail Co', category: 'E-Commerce', location: 'Toronto, CA' },
    { name: 'Apex Logistics Group', category: 'Supply Chain', location: 'New York, NY' },
    { name: 'StrixDevs Enterprise', category: 'Software Partner', location: 'Global' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) return;

    db.saveLead({
      name: formData.name,
      company: formData.company,
      email: formData.email,
      website: formData.website,
      region: formData.region,
      tier: 'Logo Slider Sponsor',
      message: formData.message,
    });

    setSubmitted(true);
  };

  return (
    <section className="my-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Sponsors & Enterprise Partners
          </span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            Trusted by Brands across Chicago, New York & Canada
          </h3>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Feature Your Brand Here</span>
          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>

      {/* Infinite Logo Marquee Slider */}
      <div className="relative w-full py-4 bg-slate-100/60 dark:bg-slate-900/40 backdrop-blur-xs border-y border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        {/* Soft edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#f8fafc] dark:from-[#030712] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#f8fafc] dark:from-[#030712] to-transparent z-10" />

        <div className="animate-marquee flex items-center gap-8">
          {[...sponsors, ...sponsors].map((s, idx) => (
            <div
              key={`${s.name}-${idx}`}
              className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-850 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition group cursor-default select-none shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition">
                {s.name[0]}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-tight">
                  {s.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {s.category} • <span className="opacity-80">{s.location}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsor Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSubmitted(false);
              }}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Partnership Request Sent</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                  Thank you! The StrixDevs sponsorship team will contact you within 24 hours with placement options for our brand slider.
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 px-6 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Sponsor Marquee Placement</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Showcase Your Brand
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Feature your company in our rotating sponsor slider seen by thousands of businesses daily.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Miller"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Company Name</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Apex POS"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Business Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@apexpos.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://apexpos.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Target Market</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Chicago & Midwest Area">Chicago & Midwest Area</option>
                    <option value="New York & Tri-State Area">New York & Tri-State Area</option>
                    <option value="Canada (Toronto, Vancouver)">Canada (Toronto, Vancouver)</option>
                    <option value="North America Wide">North America Wide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Goals / Message</label>
                  <textarea
                    rows={2}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Preferred duration or partnership requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
                >
                  Submit Sponsor Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
