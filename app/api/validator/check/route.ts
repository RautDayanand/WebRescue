import { NextRequest, NextResponse } from 'next/server';
import { validateScrapedDataset } from '@/lib/validator';
import { prisma } from '@/lib/database/prisma';

/**
 * POST /api/validator/check
 * Runs four-tier validation on extracted dataset, logs results to SQLite DB, and returns report.
 * Body: { scraperRunId?: string, data: any[], schema?: { requiredFields: string[] } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scraperRunId, data, schema } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'data parameter must be an array of extracted records' },
        { status: 400 }
      );
    }

    // 1. Run Data Validation Engine
    const validationReport = validateScrapedDataset(data, schema);

    // 2. If scraperRunId is provided, update Prisma SQLite record
    if (scraperRunId) {
      await prisma.scraperRun.update({
        where: { id: scraperRunId },
        data: {
          status: validationReport.valid ? 'SUCCESS' : 'VALIDATION_FAILED',
          validationLogs: JSON.stringify(validationReport),
        },
      });
    }

    return NextResponse.json({
      success: true,
      scraperRunId: scraperRunId || null,
      validationReport,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to validate dataset' },
      { status: 500 }
    );
  }
}
