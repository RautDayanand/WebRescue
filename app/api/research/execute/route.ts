import { NextRequest, NextResponse } from 'next/server';
import { executeAutonomousResearch } from '@/lib/ai/agent';

/**
 * POST /api/research/execute
 * Triggers full 1-Click Autonomous Research Agent execution loop across all WebRescue modules.
 * Body: { prompt: string, maxSourcesToProcess?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, maxSourcesToProcess = 1 } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'prompt parameter is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Execute Autonomous Research Agent Orchestrator
    const result = await executeAutonomousResearch({
      prompt: prompt.trim(),
      maxSourcesToProcess,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute autonomous research agent' },
      { status: 500 }
    );
  }
}
