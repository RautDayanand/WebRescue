import { NextResponse } from 'next/server';
import { runDriftSimulation } from '@/lib/healing/simulator';

/**
 * POST /api/healing/simulate
 * Triggers interactive DOM Redesign Drift Simulation ("Before vs After Website Redesign").
 */
export async function POST() {
  try {
    const result = await runDriftSimulation();
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute drift simulation' },
      { status: 500 }
    );
  }
}
