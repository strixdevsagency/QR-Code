import React, { useState } from 'react';
import { db } from '../services/db';
import { Send, CheckCircle2, ShieldCheck, MapPin, Building2, Mail } from 'lucide-react';

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
    <section id="sponsor-section" className="my-20 max-w-5xl mx-auto px-4 scroll-mt-24">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-5 p-8 sm:p-10 bg-slate-50 dark:bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800 inline-block mb-4">
                Corporate Sponsorships
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Partner with StrixDevs
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                Connect your business services with thousands of verified restaurant owners, retailers, and entrepreneurs actively printing physical marketing materials.
              </p>

              <div className="mt-8 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Focused North American Exposure</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">High audience concentration in Chicago, New York, Toronto, and Vancouver.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">High-Intent B2B Audience</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">100% active operators seeking printing, POS, design, and software solutions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Guaranteed Prominence</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Header leaderboards, sticky preview sidebar, or exclusive print PDF sponsorship.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Direct inquiries: <a href="mailto:sponsorships@strixdevs.com" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">sponsorships@strixdevs.com</a></span>
            </div>
          </div>

          {/* Right Column: High-Grade Intake Form */}
          <div className="lg:col-span-7 p-8 sm:p-10">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Partnership Inquiry Submitted</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-sm">
                  Thank you, <strong className="text-slate-900 dark:text-white">{formData.name}</strong> from <strong className="text-slate-900 dark:text-white">{formData.company}</strong>. Our enterprise team will review your application and send pricing sheets within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Apply for Corporate Sponsorship
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
                    Fill out the form below to receive media kit rates and reserved banner slots.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Miller"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Company / Brand</label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Apex POS Systems"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Business Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@apexpos.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Website URL</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://apexpos.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Target Geographic Market</label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                    >
                      <option value="Chicago & Midwest Area">Chicago & Midwest Area</option>
                      <option value="New York & Tri-State Area">New York & Tri-State Area</option>
                      <option value="Canada (Toronto, Vancouver, Montreal)">Canada (Toronto, Vancouver, Montreal)</option>
                      <option value="North America Wide">North America Wide</option>
                      <option value="Global">Worldwide / Global</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Placement Preference</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                    >
                      <option value="Top Leaderboard Banner Sponsor">Top Leaderboard Banner (728x90)</option>
                      <option value="Preview Canvas Sticky Sidebar">Sticky Canvas Sidebar (300x250)</option>
                      <option value="Print Template Feature">Print Template Exclusive Partner</option>
                      <option value="Custom StrixDevs Collaboration">Custom Technology Collaboration</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Campaign Goals</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your campaign objectives, target audience, and preferred timeframe..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Partnership Application to StrixDevs</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
