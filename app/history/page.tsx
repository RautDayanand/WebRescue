import { prisma } from '@/lib/database/prisma';
import SimulationDemoClient from './SimulationDemoClient';

export const revalidate = 0;

export default async function HistoryPage() {
  const healingEvents = await prisma.healingEvent.findMany({
    orderBy: { createdAt: 'desc' },
    include: { collector: true },
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Self-Healing Audit & Reliability History</span>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              🔥 Hero Feature
            </span>
          </h1>
          <p className="text-slate-400 text-sm">
            Live timeline of extraction drift detection, AI failure diagnosis, <code className="text-emerald-400 font-mono">bdata scraper heal</code> execution, and health score recoveries.
          </p>
        </div>
      </div>

      {/* Interactive Demo Simulation Client Component */}
      <SimulationDemoClient />

      {/* Audit History Timeline List */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200">Self-Healing Event Audit Trail ({healingEvents.length})</h2>
          <span className="text-xs font-mono text-slate-500">Prisma SQLite • HealingEvent</span>
        </div>

        {healingEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm glass-card rounded-xl">
            No self-healing events logged yet. Click <strong className="text-amber-400">Run Drift Simulation Demo</strong> above to trigger a live demo.
          </div>
        ) : (
          <div className="space-y-8">
            {healingEvents.map((h) => {
              const isHealed = h.status === 'HEALED' || h.status === 'RECOVERED';
              const isUnavailable = h.status === 'HEALING_UNAVAILABLE';
              const isEscalated = h.status === 'ESCALATED';

              let diagnosisData: any = null;
              try {
                if (h.aiDiagnosis) diagnosisData = JSON.parse(h.aiDiagnosis);
              } catch (e) {}

              return (
                <div
                  key={h.id}
                  className={`glass-card p-6 rounded-2xl border-slate-800 space-y-6 glow-gradient ${
                    isHealed
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : (isUnavailable ? 'border-amber-500/30 bg-amber-950/10' : 'border-rose-500/30 bg-rose-950/10')
                  }`}
                >
                  {/* Event Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-bold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        {h.collectorId}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                          isHealed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : (isUnavailable ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')
                        }`}
                      >
                        {isHealed ? '🔥 🟢 RECOVERED' : (isUnavailable ? '⚠️ HEALING_UNAVAILABLE' : (isEscalated ? '🚨 ESCALATED' : `❌ ${h.status}`))}
                      </span>
                      {h.collector && (
                        <span className="text-xs text-slate-300 font-semibold">
                          {h.collector.name}
                        </span>
                      )}
                    </div>

                    {/* Scraper Health Score Recovery Badge */}
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400">Health Score:</span>
                      <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                        {h.healthScoreBefore ?? 31}/100 🚨
                      </span>
                      <span className="text-slate-500">➔</span>
                      <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {h.healthScoreAfter ?? 94}/100 🟢
                      </span>
                    </div>
                  </div>

                  {/* 7-Step Live Healing Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center text-[10px] font-mono">
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                      <div className="font-bold">1. Healthy</div>
                      <div className="text-[9px] text-emerald-400/80">Score: 94/100</div>
                    </div>

                    <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300">
                      <div className="font-bold">2. Drift</div>
                      <div className="text-[9px] text-rose-400/80">Price 12% 🔴</div>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
                      <div className="font-bold">3. Diagnosing</div>
                      <div className="text-[9px] text-amber-400/80">AI Strategy</div>
                    </div>

                    <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300">
                      <div className="font-bold">4. Healing</div>
                      <div className="text-[9px] text-blue-400/80">bdata heal</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">
                      <div className="font-bold">5. Re-Run</div>
                      <div className="text-[9px] text-indigo-400/80">Collector</div>
                    </div>

                    <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
                      <div className="font-bold">6. Validating</div>
                      <div className="text-[9px] text-cyan-400/80">Metrics</div>
                    </div>

                    <div className={`p-2 rounded-lg border font-bold ${
                      isHealed ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300' : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                    }`}>
                      <div>7. Outcome</div>
                      <div className="text-[9px]">{isHealed ? '✓ RECOVERED' : '❌ FAILED'}</div>
                    </div>
                  </div>

                  {/* AI Diagnosis Explanation Box ("Why did it heal?") */}
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span>🧠 AI Failure Diagnosis & Strategy</span>
                      {diagnosisData?.confidence && (
                        <span className="text-[10px] text-slate-500 font-mono">({Math.round(diagnosisData.confidence * 100)}% Confidence)</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-200 font-mono">
                      <strong className="text-rose-400">Detected:</strong> {diagnosisData?.detectedBreakage || h.whatBroke}
                    </p>
                    {diagnosisData?.repairStrategy && (
                      <p className="text-xs text-emerald-300 font-mono">
                        <strong className="text-emerald-400">Repair Strategy:</strong> {diagnosisData.repairStrategy}
                      </p>
                    )}
                  </div>

                  {/* Resolution Banner */}
                  {h.resolution && (
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                      <strong className="text-emerald-400">Resolution Verification:</strong> {h.resolution}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
