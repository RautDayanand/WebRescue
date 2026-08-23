import { getRecentScraperRunsFromDB } from '@/lib/scraper';

export const revalidate = 0;

function parseJsonSafe(val: any) {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

export default async function RunsPage() {
  const runs = await getRecentScraperRunsFromDB(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Scraper Execution & Validation Runs</h1>
        <p className="text-slate-400 text-sm">
          Audit raw Bright Data responses, normalized outputs, and Data Validation Engine health checks.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Execution & Validation History ({runs.length})</h2>
          <span className="text-xs font-mono text-slate-500">Prisma SQLite • ScraperRun</span>
        </div>

        {runs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm glass-card rounded-xl">
            No scraper execution runs recorded in the database yet. Run <code className="text-blue-400 font-mono">npx tsx scripts/test-validation.ts</code> or execute a run via API.
          </div>
        ) : (
          <div className="space-y-6">
            {runs.map((r) => {
              const rawObj = parseJsonSafe(r.rawData);
              const normObj = parseJsonSafe(r.normalizedData);
              const valLogs = parseJsonSafe(r.validationLogs);
              const recordCount = Array.isArray(normObj) ? normObj.length : (normObj ? 1 : 0);

              const isValid = valLogs?.valid ?? (r.status === 'SUCCESS');
              const hasDrift = valLogs?.errors?.some((e: any) => e.type === 'EXTRACTION_DRIFT');

              return (
                <div
                  key={r.id}
                  className={`glass-card p-6 rounded-2xl border-slate-800 space-y-4 glow-gradient ${
                    hasDrift ? 'border-rose-500/40 bg-rose-950/10' : ''
                  }`}
                >
                  {/* Top Bar Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        {r.collectorId}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        isValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isValid ? '✓ SUCCESS' : (hasDrift ? '❌ EXTRACTION_DRIFT' : `❌ ${r.status}`)}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800">
                        Records Extracted: <strong>{recordCount}</strong>
                      </span>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Validation Report Banner */}
                  {valLogs && (
                    <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                      isValid ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>🛡️ Validation Engine Audit ({valLogs.severity} Severity)</span>
                        <span>{isValid ? 'All Schema & Range Checks Passed' : 'Validation Anomaly Triggered'}</span>
                      </div>

                      {valLogs.errors && valLogs.errors.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-semibold text-rose-400">Critical Errors Detected:</p>
                          {valLogs.errors.map((err: any, idx: number) => (
                            <p key={idx} className="font-mono bg-slate-950/80 p-2 rounded border border-rose-900/50">
                              [{err.type}] Field "{err.field}": {err.message}
                            </p>
                          ))}
                        </div>
                      )}

                      {valLogs.metrics?.fieldCompleteness && (
                        <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
                          <span className="font-sans font-semibold text-slate-300">Field Completeness:</span>
                          {Object.entries(valLogs.metrics.fieldCompleteness).map(([f, score]: [string, any]) => (
                            <span key={f} className={`px-2 py-0.5 rounded ${score < 0.4 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-slate-900 text-slate-300'}`}>
                              {f}: {Math.round(score * 100)}%
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Side-by-Side Diff Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Raw Scraper Data */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Raw Bright Data JSON Output
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Unstructured String Input</span>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto max-h-56 border border-slate-800/80 leading-relaxed">
                        {JSON.stringify(rawObj, null, 2) || 'No raw output'}
                      </pre>
                    </div>

                    {/* Normalized Output */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                          Normalized & Typed Dataset
                        </span>
                        <span className="text-[10px] text-emerald-500/80 font-mono">Clean Numbers & Currencies</span>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-56 border border-emerald-900/40 leading-relaxed">
                        {JSON.stringify(normObj, null, 2) || 'No normalized output'}
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
