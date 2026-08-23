import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-blue-500/20 glow-gradient overflow-hidden text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          ⚡ Autonomous Web Scraper & Self-Healing Engine
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
          Give an AI Agent a Web-Data Goal. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            It Discovers, Scrapes, Validates & Self-Heals.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
          WebRescue automatically creates Bright Data collectors, transforms unstructured web data into validated schemas, detects extraction failure, and heals scrapers autonomously.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/research"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <span>Start AI Research</span>
            <span>→</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl glass-card text-slate-200 font-medium hover:bg-slate-800/80 transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* 10-Step Architecture Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-200 text-center">WebRescue Architecture & Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
              1-3
            </div>
            <h3 className="text-lg font-semibold text-slate-100">AI Goal Planner</h3>
            <p className="text-sm text-slate-400">
              Converts complex natural language requirements into structured machine-readable research plans.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
              4-6
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Bright Data Scraper Studio</h3>
            <p className="text-sm text-slate-400">
              Generates targeted collectors via CLI/API, extracts data from target sites, and normalizes formats.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border-emerald-500/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              7-8 🔥
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Self-Healing Engine</h3>
            <p className="text-sm text-slate-400">
              Detects extraction anomalies and DOM structure shifts, triggering <code className="text-xs bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded">bdata scraper heal</code> automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
