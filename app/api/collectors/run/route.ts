import { NextRequest, NextResponse } from 'next/server';
import { runBrightDataCollector } from '@/lib/brightdata';
import { saveScraperRunToDB, normalizeScrapedData } from '@/lib/scraper';

/**
 * POST /api/collectors/run
 * Execute a Bright Data scraper collector, normalize data, and save ScraperRun record to DB
 * Body: { collectorId: string, url: string, sync?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectorId, url, sync = true } = body;

    if (!collectorId || !url) {
      return NextResponse.json(
        { success: false, error: 'collectorId and url are required fields' },
        { status: 400 }
      );
    }

    // Run scraper via Bright Data CLI wrapper
    const runResult = await runBrightDataCollector(collectorId, url, { sync });

    // Normalize output data
    const normalizedData = normalizeScrapedData(runResult.data);

    // Save ScraperRun record to SQLite DB
    const scraperRunRecord = await saveScraperRunToDB({
      collectorId: runResult.collectorId,
      status: runResult.status,
      rawData: runResult.data,
      normalizedData,
    });

    return NextResponse.json({
      success: true,
      runId: scraperRunRecord.id,
      collectorId: runResult.collectorId,
      status: runResult.status,
      rawData: runResult.data,
      normalizedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute collector' },
      { status: 500 }
    );
  }
}
