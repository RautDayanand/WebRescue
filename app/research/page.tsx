'use client';

import { useState } from 'react';
import { StructuredResearchPlan } from '@/lib/ai';
import { DiscoveredSource } from '@/lib/scraper/discovery';

export default function ResearchPage() {
  const [goalInput, setGoalInput] = useState(
    'Find laptops under ₹80,000 with 16GB RAM and at least 512GB SSD.'
  );

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 3 State
  const [currentPlan, setCurrentPlan] = useState<StructuredResearchPlan | null>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  // Step 4 State
  const [discoveredSources, setDiscoveredSources] = useState<DiscoveredSource[] | null>(null);
  const [selectedSource, setSelectedSource] = useState<DiscoveredSource | null>(null);

  // Step 5 State
  const [generatedCollector, setGeneratedCollector] = useState<any | null>(null);
  const [extractionDesc, setExtractionDesc] = useState<string | null>(null);

  // Step 9 Autonomous Agent Output State
  const [agentOutput, setAgentOutput] = useState<any | null>(null);

  const handleExecuteAutonomousAgent = async () => {
    if (!goalInput.trim()) return;
    setLoadingAgent(true);
    setError(null);
    setAgentOutput(null);

    try {
      const res = await fetch('/api/research/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: goalInput }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to execute autonomous agent');
      }

      setAgentOutput(data.data);
      setCurrentPlan(data.data.plan);
      setGoalId(data.data.goalId);
    } catch (err: any) {
      setError(err.message || 'An error occurred during autonomous research execution');
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!goalInput.trim()) return;
    setLoadingPlan(true);
    setError(null);
    setDiscoveredSources(null);
    setSelectedSource(null);
    setGeneratedCollector(null);
    setAgentOutput(null);

    try {
      const res = await fetch('/api/research/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalInput }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      setCurrentPlan(data.plan);
      setGoalId(data.goalId);
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">WebRescue Autonomous Research Agent 🤖</h1>
        <p className="text-slate-400 text-sm">
          Give an AI agent a web-data goal. It discovers sources, builds scrapers, validates data, self-heals failures, and delivers structured answers.
        </p>
      </div>

      {/* Input Box Panel */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4 glow-gradient">
        <label className="block text-sm font-semibold text-slate-200">
          What do you want to research?
        </label>
        <textarea
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="e.g. Find laptops under ₹80,000 with 16GB RAM and at least 512GB SSD."
          className="w-full h-28 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm leading-relaxed"
        />

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <span className="text-xs text-slate-500">
            End-to-End: Plan ➔ Discover ➔ Scrape ➔ Validate ➔ Heal ➔ Analyze
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={loadingPlan || loadingAgent || !goalInput.trim()}
              className="px-4 py-2.5 rounded-xl glass-card text-slate-300 font-medium text-xs hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Step-by-Step Plan
            </button>

            <button
              onClick={handleExecuteAutonomousAgent}
              disabled={loadingAgent || loadingPlan || !goalInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 border border-blue-400/30 disabled:opacity-50"
            >
              {loadingAgent ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  <span>Executing Agent Loop...</span>
                </>
              ) : (
                <>
                  <span>🚀 Run Autonomous Agent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* STEP 9: Synthesized AI Research Output Card */}
      {agentOutput && (
        <div className="glass-panel p-6 rounded-2xl border-emerald-500/40 bg-emerald-950/10 space-y-6 animate-in fade-in duration-300 glow-gradient">
          {/* Top Banner */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Step 9: Autonomous Research Complete
              </span>
              <h2 className="text-2xl font-extrabold text-slate-100 mt-2">Synthesized Research Findings</h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {Math.round(agentOutput.confidence * 100)}% Confidence
              </span>
              <p className="text-[10px] text-slate-500">Validated Dataset</p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Executive Summary</h3>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">{agentOutput.summary}</p>
          </div>

          {/* Extracted Options Results Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Best Validated Options Found ({agentOutput.results.length})</h3>
            <div className="grid grid-cols-1 gap-3">
              {agentOutput.results.map((item: any, idx: number) => (
                <div key={idx} className="glass-card p-4 rounded-xl flex items-center justify-between border-slate-800">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-100">{idx + 1}. {item.name}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      {item.ram && <span>RAM: {item.ram}GB</span>}
                      {item.storage && <span>Storage: {item.storage}GB</span>}
                      {item.rating && <span>Rating: ⭐ {item.rating}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">
                      {item.price_currency || '₹'}{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights & Best Value Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Comparison Highlights</h3>
              <div className="space-y-2">
                {agentOutput.comparison.map((c: any, idx: number) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <strong className="text-slate-300">{c.title}:</strong>
                    <p className="text-slate-400">{c.details}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Recommendation</h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">{agentOutput.recommendation}</p>
            </div>
          </div>

          {/* Self-Healing Trigger Callout Banner */}
          {agentOutput.healingEventsTriggered && agentOutput.healingEventsTriggered.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1">
              <span className="font-bold text-amber-400">🔥 Autonomous Self-Healing Triggered:</span>
              {agentOutput.healingEventsTriggered.map((h: any, idx: number) => (
                <p key={idx} className="font-mono text-amber-200">
                  Collector {h.collectorId}: {h.details} (Status: {h.status})
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3 Display Plan Card if generated manually */}
      {currentPlan && !agentOutput && (
        <div className="glass-panel p-6 rounded-2xl border-blue-500/30 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Plan Generated & Saved
                </span>
                {goalId && <span className="text-xs font-mono text-slate-500">ID: {goalId}</span>}
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1">AI Research Plan</h2>
            </div>
            <button
              onClick={() => setShowJson(!showJson)}
              className="px-3 py-1.5 rounded-lg glass-card text-slate-300 text-xs font-mono hover:bg-slate-800"
            >
              {showJson ? 'View Graphic Card' : '{ } View Raw JSON'}
            </button>
          </div>

          {showJson ? (
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(currentPlan, null, 2)}
            </pre>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Entity</h3>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.entities.map((e, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold text-sm capitalize">
                      📦 {e}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Fields ({currentPlan.fields.length})</h3>
                <div className="space-y-1.5">
                  {currentPlan.fields.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-200">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-4 rounded-xl space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Constraints</h3>
                {Object.keys(currentPlan.constraints).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No specific numerical constraints parsed</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(currentPlan.constraints).map(([k, v], idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 font-mono">{k}</span>
                        <span className="font-semibold text-amber-300 font-mono">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
