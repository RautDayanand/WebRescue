import { prisma } from '../database/prisma';
export { normalizeScrapedData } from './normalizer';

export async function getAllCollectorsFromDB() {
  return await prisma.collector.findMany({
    orderBy: { createdAt: 'desc' },
    include: { runs: { take: 5, orderBy: { createdAt: 'desc' } }, healingEvents: { take: 5 } },
  });
}

export async function getRecentScraperRunsFromDB(limit = 20) {
  return await prisma.scraperRun.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { collector: true, researchGoal: true },
  });
}

export interface CreateCollectorInput {
  collectorId: string;
  name: string;
  url: string;
  fields: string[];
  status?: string;
  healthScore?: number;
}

export interface CreateScraperRunInput {
  collectorId: string;
  researchGoalId?: string;
  status: string;
  rawData?: any;
  normalizedData?: any;
  validationLogs?: any;
}

export interface CreateHealingEventInput {
  collectorId: string;
  triggerReason: string;
  whatBroke: string;
  aiDiagnosis?: any;
  healthScoreBefore?: number;
  healthScoreAfter?: number;
  healingMode?: string;
  status?: string;
  resolution?: string;
}

/**
 * Saves or updates a Collector in Prisma SQLite DB
 */
export async function saveCollectorToDB(input: CreateCollectorInput) {
  return await prisma.collector.upsert({
    where: { collectorId: input.collectorId },
    update: {
      name: input.name,
      url: input.url,
      fields: JSON.stringify(input.fields),
      status: input.status || 'ACTIVE',
      healthScore: input.healthScore ?? 100,
    },
    create: {
      collectorId: input.collectorId,
      name: input.name,
      url: input.url,
      fields: JSON.stringify(input.fields),
      status: input.status || 'ACTIVE',
      healthScore: input.healthScore ?? 100,
    },
  });
}

/**
 * Updates a Collector's Health Score in Prisma SQLite DB
 */
export async function updateCollectorHealthScore(collectorId: string, healthScore: number, status?: string) {
  return await prisma.collector.update({
    where: { collectorId },
    data: {
      healthScore,
      ...(status ? { status } : {}),
    },
  });
}

/**
 * Saves a ScraperRun in Prisma SQLite DB
 */
export async function saveScraperRunToDB(input: CreateScraperRunInput) {
  await prisma.collector.upsert({
    where: { collectorId: input.collectorId },
    update: {},
    create: {
      collectorId: input.collectorId,
      name: `collector-${input.collectorId}`,
      url: 'https://news.ycombinator.com',
      fields: '[]',
      status: 'ACTIVE',
      healthScore: 100,
    },
  });

  return await prisma.scraperRun.create({
    data: {
      collectorId: input.collectorId,
      researchGoalId: input.researchGoalId || null,
      status: input.status,
      rawData: input.rawData ? JSON.stringify(input.rawData) : null,
      normalizedData: input.normalizedData ? JSON.stringify(input.normalizedData) : null,
      validationLogs: input.validationLogs ? JSON.stringify(input.validationLogs) : null,
    },
  });
}

/**
 * Persists a HealingEvent audit log
 */
export async function saveHealingEventToDB(input: CreateHealingEventInput) {
  await prisma.collector.upsert({
    where: { collectorId: input.collectorId },
    update: {},
    create: {
      collectorId: input.collectorId,
      name: `collector-${input.collectorId}`,
      url: 'https://news.ycombinator.com',
      fields: '[]',
      status: 'ACTIVE',
      healthScore: 100,
    },
  });

  return await prisma.healingEvent.create({
    data: {
      collectorId: input.collectorId,
      triggerReason: input.triggerReason,
      whatBroke: input.whatBroke,
      aiDiagnosis: input.aiDiagnosis ? JSON.stringify(input.aiDiagnosis) : null,
      healthScoreBefore: input.healthScoreBefore ?? 31,
      healthScoreAfter: input.healthScoreAfter ?? 94,
      healingMode: input.healingMode || 'AUTOMATIC',
      status: input.status || 'HEALED',
      resolution: input.resolution || null,
    },
  });
}
