import { NextRequest, NextResponse } from 'next/server';
import { healBrightDataCollector } from '@/lib/brightdata';
import { saveHealingEventToDB } from '@/lib/scraper';

/**
 * POST /api/collectors/heal
 * Trigger Bright Data scraper self-healing via `bdata scraper heal <collector_id> "<whatBroke>"`
 * Body: { collectorId: string, whatBroke: string, targetUrl?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectorId, whatBroke, targetUrl } = body;

    if (!collectorId || !whatBroke) {
      return NextResponse.json(
        { success: false, error: 'collectorId and whatBroke are required fields' },
        { status: 400 }
      );
    }

    // Trigger Bright Data scraper heal
    const healResult = await healBrightDataCollector({
      collectorId,
      whatBroke,
      targetUrl,
      autoApprove: true,
    });

    // Save HealingEvent record to SQLite DB
    const healingRecord = await saveHealingEventToDB({
      collectorId,
      triggerReason: 'MANUAL_OR_VALIDATION_FAILURE',
      whatBroke,
      status: healResult.status,
      resolution: healResult.details,
    });

    return NextResponse.json({
      success: true,
      healingEvent: healingRecord,
      healResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to trigger scraper healing' },
      { status: 500 }
    );
  }
}
