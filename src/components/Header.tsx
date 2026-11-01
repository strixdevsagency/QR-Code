interface HeaderProps {
  activeTab: 'generate' | 'scan';
  setActiveTab: (tab: 'generate' | 'scan') => void;
  onNavigateToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onNavigateToSection }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
            S
          </div>
          <div className="leading-tight">
            <span className="text-base font-bold text-white tracking-tight">
              Strix<span className="text-indigo-400">QR</span>
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              by strix-devs
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === 'generate'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Generator
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3.5 py-1.5 rounded-md transition ${
              activeTab === 'scan'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Scanner
          </button>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => onNavigateToSection('why-expire')}
            className="hidden sm:inline text-slate-400 hover:text-indigo-300 transition"
          >
            Why Free?
          </button>
          <button
            onClick={() => onNavigateToSection('sponsor-section')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 transition font-medium"
          >
            Sponsor
          </button>
        </div>
      </div>
    </header>
  );
};
