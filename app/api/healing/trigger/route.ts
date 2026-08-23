import { NextRequest, NextResponse } from 'next/server';
import { orchestrateSelfHealing } from '@/lib/healing';

/**
 * POST /api/healing/trigger
 * Triggers the complete Self-Healing Lifecycle for a failing collector.
 * Body: { collectorId: string, targetUrl: string, validationReport?: any, whatBrokeHint?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collectorId, targetUrl, validationReport, whatBrokeHint } = body;

    if (!collectorId || !targetUrl) {
      return NextResponse.json(
        { success: false, error: 'collectorId and targetUrl are required parameters' },
        { status: 400 }
      );
    }

    // Execute Self-Healing Engine Orchestrator
    const healingResult = await orchestrateSelfHealing({
      collectorId,
      targetUrl,
      validationReport,
      whatBrokeHint,
    });

    return NextResponse.json({
      success: true,
      result: healingResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute self-healing workflow' },
      { status: 500 }
    );
  }
}
