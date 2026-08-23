import { prisma } from '../database/prisma';
import { StructuredResearchPlan } from './index';

/**
 * Persists a ResearchPlan into the SQLite ResearchGoal table
 */
export async function saveResearchGoalToDB(plan: StructuredResearchPlan) {
  return await prisma.researchGoal.create({
    data: {
      goal: plan.goal,
      entities: JSON.stringify(plan.entities),
      fields: JSON.stringify(plan.fields),
      constraints: JSON.stringify(plan.constraints),
      status: 'PENDING',
    },
  });
}

/**
 * Fetches all saved ResearchGoals
 */
export async function getAllResearchGoalsFromDB() {
  return await prisma.researchGoal.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      runs: true,
    },
  });
}
