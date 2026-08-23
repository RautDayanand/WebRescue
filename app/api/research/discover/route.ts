import { NextRequest, NextResponse } from 'next/server';
import { discoverSources } from '@/lib/scraper/discovery';
import { StructuredResearchPlan } from '@/lib/ai';

/**
 * POST /api/research/discover
 * Takes a ResearchPlan and returns 2-3 matched candidate public target web sources.
 * Body: { researchGoalId?: string, plan: StructuredResearchPlan }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { researchGoalId, plan } = body;

    if (!plan || !plan.entities) {
      return NextResponse.json(
        { success: false, error: 'A valid research plan is required for source discovery' },
        { status: 400 }
      );
    }

    // Run Source Discovery Engine
    const sources = discoverSources(plan as StructuredResearchPlan);

    return NextResponse.json({
      success: true,
      goalId: researchGoalId || null,
      sources,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to discover target sources' },
      { status: 500 }
    );
  }
}
