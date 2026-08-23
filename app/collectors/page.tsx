import { getAllCollectorsFromDB } from '@/lib/scraper';
import Link from 'next/link';

export const revalidate = 0;

export default async function CollectorsPage() {
  const collectors = await getAllCollectorsFromDB();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Bright Data Collectors</h1>
          <p className="text-slate-400 text-sm">Manage registered Scraper Studio collector endpoints and schemas.</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
          bdata scraper list
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Registered Collectors ({collectors.length})</h2>

        {collectors.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm glass-card rounded-xl">
            No Bright Data collectors registered in database yet. Run <code className="text-blue-400 font-mono">npx tsx scripts/test-brightdata.ts</code> or use POST /api/collectors.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {collectors.map((c) => (
              <div key={c.id} className="glass-card p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{c.name}</span>
                    <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-blue-400 border border-slate-700">
                      {c.collectorId}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono truncate max-w-lg">{c.url}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>Runs: {c.runs.length}</span>
                  <span>Heals: {c.healingEvents.length}</span>
                  <span>Created: {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
