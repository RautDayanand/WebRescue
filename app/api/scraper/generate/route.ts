import { NextRequest, NextResponse } from 'next/server';
import { generateScraperCollector } from '@/lib/scraper/generator';

/**
 * POST /api/scraper/generate
 * Takes a ResearchPlan and a selected Source, constructs extraction criteria, and creates a Bright Data Collector.
 * Body: { plan: StructuredResearchPlan, source: { name: string, url: string } }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, source } = body;

    if (!plan || !source || !source.url) {
      return NextResponse.json(
        { success: false, error: 'Both plan and selected source object are required' },
        { status: 400 }
      );
    }

    // Execute Autonomous Scraper Generator
    const result = await generateScraperCollector({ plan, source });

    return NextResponse.json({
      success: true,
      collector: result.collector,
      brightData: result.brightData,
      descriptionUsed: result.descriptionUsed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate scraper collector' },
      { status: 500 }
    );
  }
}
