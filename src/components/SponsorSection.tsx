import React, { useState } from 'react';

export const SponsorSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    region: 'North America',
    message: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="sponsor-section" className="my-14 max-w-2xl mx-auto px-4 scroll-mt-20">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 block mb-1">
            Partnership
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sponsor Strix QR
          </h2>
          <p className="text-slate-400 mt-1 text-xs">
            Promote your brand to thousands of business owners across Chicago, New York & Canada.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <h3 className="text-sm font-bold text-white">Inquiry Received</h3>
            <p className="text-xs text-slate-300 mt-1">
              Thank you, <strong className="text-emerald-400">{formData.name}</strong> ({formData.company}). The StrixDevs team will reply within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Miller"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Apex Solutions"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@apex.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Market</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Chicago & Midwest">Chicago & Midwest</option>
                  <option value="New York & Tri-State">New York & Tri-State</option>
                  <option value="Canada">Canada</option>
                  <option value="North America Wide">North America Wide</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Message / Goals</label>
              <textarea
                rows={2}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Preferred sponsorship duration or objectives..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-750 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              Submit Sponsorship Request
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
