import { StructuredResearchPlan } from '../ai';
import { createBrightDataCollector, CollectorCreationResult } from '../brightdata';
import { saveCollectorToDB } from './index';

export interface SourceInput {
  name: string;
  url: string;
}

export interface GenerateScraperInput {
  plan: StructuredResearchPlan;
  source: SourceInput;
}

export interface ScraperGenerationResult {
  collector: any;
  brightData: CollectorCreationResult;
  descriptionUsed: string;
}

/**
 * 5.1 — Autonomous Scraper Generator Engine
 * Transforms a StructuredResearchPlan + Selected Source into a real Bright Data Collector ID.
 */
export async function generateScraperCollector(
  input: GenerateScraperInput
): Promise<ScraperGenerationResult> {
  const { plan, source } = input;

  if (!plan || !source || !source.url) {
    throw new Error('A valid ResearchPlan and target source URL are required for scraper generation.');
  }

  // 1. Construct target extraction description from Research Plan
  const fieldList = Array.isArray(plan.fields) && plan.fields.length > 0
    ? plan.fields.join(', ')
    : 'name, price, url';
    
  const entityName = Array.isArray(plan.entities) && plan.entities.length > 0
    ? plan.entities[0]
    : 'product';

  const constraintDetails = plan.constraints && Object.keys(plan.constraints).length > 0
    ? ` with constraints: ${JSON.stringify(plan.constraints)}`
    : '';

  const extractionDescription = `Extract ${entityName} details: ${fieldList}${constraintDetails}`;
  const scraperName = `${source.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-collector`;

  // 2. Invoke real Bright Data Scraper Studio creation CLI wrapper
  const brightDataResult = await createBrightDataCollector({
    url: source.url,
    description: extractionDescription,
    name: scraperName,
  });

  // 3. Persist Collector metadata record to Prisma SQLite Database
  const savedCollector = await saveCollectorToDB({
    collectorId: brightDataResult.collectorId,
    name: brightDataResult.name,
    url: brightDataResult.url,
    fields: plan.fields,
  });

  return {
    collector: savedCollector,
    brightData: brightDataResult,
    descriptionUsed: extractionDescription,
  };
}
