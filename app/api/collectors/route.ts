import { NextRequest, NextResponse } from 'next/server';
import { createBrightDataCollector } from '@/lib/brightdata';
import { saveCollectorToDB, getAllCollectorsFromDB } from '@/lib/scraper';

/**
 * GET /api/collectors
 * Fetch all registered collectors from SQLite database
 */
export async function GET() {
  try {
    const collectors = await getAllCollectorsFromDB();
    return NextResponse.json({ success: true, collectors });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch collectors' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collectors
 * Create a new Bright Data scraper collector and store in DB
 * Body: { url: string, description: string, name?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, description, name } = body;

    if (!url || !description) {
      return NextResponse.json(
        { success: false, error: 'url and description are required fields' },
        { status: 400 }
      );
    }

    // Call Bright Data CLI creation wrapper
    const result = await createBrightDataCollector({
      url,
      description,
      name,
    });

    // Save Collector record to SQLite DB
    const savedRecord = await saveCollectorToDB({
      collectorId: result.collectorId,
      name: result.name,
      url: result.url,
      fields: [description],
    });

    return NextResponse.json({
      success: true,
      collector: savedRecord,
      brightData: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create collector' },
      { status: 500 }
    );
  }
}
