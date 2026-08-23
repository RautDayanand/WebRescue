import { validateScrapedDataset } from '../validator';
import { formulateRepairPrompt, generateAIDiagnosis } from './index';
import { saveHealingEventToDB, saveCollectorToDB, saveScraperRunToDB } from '../scraper';

export interface DriftSimulationResult {
  collectorId: string;
  collectorName: string;
  targetUrl: string;
  beforeHtmlSnippet: string;
  afterHtmlSnippet: string;
  beforeCompleteness: { price: number; ram: number; storage: number };
  afterDriftCompleteness: { price: number; ram: number; storage: number };
  recoveredCompleteness: { price: number; ram: number; storage: number };
  healthScoreBefore: number;
  healthScoreDrift: number;
  healthScoreRecovered: number;
  aiDiagnosis: any;
  status: 'RECOVERED' | 'HEALED';
  healingEventId: string;
}

/**
 * Executes a full interactive DOM Website Redesign & Drift Simulation
 */
export async function runDriftSimulation(): Promise<DriftSimulationResult> {
  const collectorId = 'c_drift_demo_789';
  const collectorName = 'TechGear Laptop Scraper';
  const targetUrl = 'https://news.ycombinator.com';

  // 1. Setup Collector in DB
  await saveCollectorToDB({
    collectorId,
    name: collectorName,
    url: targetUrl,
    fields: ['name', 'price', 'ram', 'storage'],
    status: 'ACTIVE',
    healthScore: 94,
  });

  // HTML snippets showing website change
  const beforeHtmlSnippet = `<div class="product-item">\n  <h2 class="title">TechGear Pro Laptop</h2>\n  <div class="product-price">₹74,999</div>\n</div>`;
  const afterHtmlSnippet = `<div data-component="product-card">\n  <h2 class="title">TechGear Pro Laptop</h2>\n  <div data-testid="price-container">\n    <span class="amount">₹74,999</span>\n  </div>\n</div>`;

  // Before Data: 96% completeness
  const healthyDataset = Array.from({ length: 50 }).map((_, i) => ({
    name: `Laptop #${i + 1}`,
    price: i < 48 ? 74999 : null,
    ram: 16,
    storage: 512,
  }));
  const healthyVal = validateScrapedDataset(healthyDataset);

  // After Website Redesign: Price selector breaks -> 12% completeness
  const driftedDataset = Array.from({ length: 50 }).map((_, i) => ({
    name: `Laptop #${i + 1}`,
    price: i < 6 ? 74999 : null, // 12% completeness
    ram: 16,
    storage: 512,
  }));
  const driftVal = validateScrapedDataset(driftedDataset);

  // Formulate AI Diagnosis
  const aiDiagnosis = generateAIDiagnosis(driftVal, `DOM selector ".product-price" broken after site redesign. Price field completeness dropped 96% -> 12%.`);
  const repairPrompt = formulateRepairPrompt(driftVal);

  // Simulated Recovered Dataset after Bright Data Heal: 94% completeness
  const recoveredDataset = Array.from({ length: 50 }).map((_, i) => ({
    name: `Laptop #${i + 1}`,
    price: i < 47 ? 74999 : null, // 94% completeness
    ram: 16,
    storage: 512,
  }));
  const recoveredVal = validateScrapedDataset(recoveredDataset);

  // Save Scraper Run for initial drift
  await saveScraperRunToDB({
    collectorId,
    status: 'VALIDATION_FAILED',
    rawData: driftedDataset,
    normalizedData: driftedDataset,
    validationLogs: driftVal,
  });

  // Save Scraper Run for recovered data
  await saveScraperRunToDB({
    collectorId,
    status: 'SUCCESS',
    rawData: recoveredDataset,
    normalizedData: recoveredDataset,
    validationLogs: recoveredVal,
  });

  // Save Healing Event in DB
  const healingEvent = await saveHealingEventToDB({
    collectorId,
    triggerReason: 'DOM_SELECTOR_REDESIGN_DRIFT',
    whatBroke: repairPrompt,
    aiDiagnosis,
    healthScoreBefore: driftVal.healthScore, // 31
    healthScoreAfter: recoveredVal.healthScore, // 94
    healingMode: 'AUTOMATIC',
    status: 'RECOVERED',
    resolution: `DOM selector updated from ".product-price" to "[data-testid='price-container'] .amount". Price extraction completeness restored from 12% to 94%.`,
  });

  return {
    collectorId,
    collectorName,
    targetUrl,
    beforeHtmlSnippet,
    afterHtmlSnippet,
    beforeCompleteness: { price: 0.96, ram: 1.0, storage: 1.0 },
    afterDriftCompleteness: { price: 0.12, ram: 1.0, storage: 1.0 },
    recoveredCompleteness: { price: 0.94, ram: 1.0, storage: 1.0 },
    healthScoreBefore: healthyVal.healthScore, // 94
    healthScoreDrift: driftVal.healthScore, // 31
    healthScoreRecovered: recoveredVal.healthScore, // 94
    aiDiagnosis,
    status: 'RECOVERED',
    healingEventId: healingEvent.id,
  };
}
