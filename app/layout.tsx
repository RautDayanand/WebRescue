import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'WebRescue — Autonomous AI Web Scraper & Self-Healing Platform',
  description: 'AI-driven web data extraction, validation, and automated self-healing scrapers powered by Bright Data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-blue-500 selection:text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/60 bg-[#0b0f19]/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white group">
                <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
                  🕷️
                </span>
                <span>Web<span className="text-blue-500">Rescue</span></span>
              </Link>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                System Ready
              </span>
            </div>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                Dashboard
              </Link>
              <Link href="/research" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                AI Planner
              </Link>
              <Link href="/collectors" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                Collectors
              </Link>
              <Link href="/runs" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                Runs
              </Link>
              <Link href="/history" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                History
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 glass-panel mt-auto">
          <p>WebRescue © 2026 — Autonomous AI Web-Data Agent & Self-Healing Scrapers powered by Bright Data</p>
        </footer>
      </body>
    </html>
  );
}
