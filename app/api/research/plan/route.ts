import { NextRequest, NextResponse } from 'next/server';
import { planResearchGoal } from '@/lib/ai';
import { saveResearchGoalToDB } from '@/lib/ai/persistence';

/**
 * POST /api/research/plan
 * Converts a natural language research goal into a structured ResearchPlan and saves to DB.
 * Body: { goal: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal } = body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'goal parameter is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // 1. Generate Structured Research Plan
    const plan = await planResearchGoal(goal);

    // 2. Persist to Prisma Database
    const savedGoalRecord = await saveResearchGoalToDB(plan);

    // 3. Return validated plan to UI
    return NextResponse.json({
      success: true,
      goalId: savedGoalRecord.id,
      plan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate research plan' },
      { status: 500 }
    );
  }
}
