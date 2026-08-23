import { executeAutonomousResearch } from '../lib/ai/agent';
import { prisma } from '../lib/database/prisma';

async function main() {
  console.log('----------------------------------------------------');
  console.log('🤖 WebRescue — Step 9 Autonomous Research Agent Test');
  console.log('----------------------------------------------------');

  const prompt = 'Find laptops under ₹80,000 with 16GB RAM and 512GB SSD.';
  console.log(`\n1️⃣ Executing Autonomous Agent Loop for: "${prompt}"`);

  const output = await executeAutonomousResearch({ prompt, maxSourcesToProcess: 2 });

  console.log('\n   ✅ Autonomous Agent Loop Complete!');
  console.log('      Goal ID:', output.goalId);
  console.log('      Plan Entities:', output.plan.entities);
  console.log('      Plan Fields:', output.plan.fields);
  console.log('      Sources Discovered:', output.sourcesDiscovered.length);
  console.log('      Collectors Used:', output.collectorsUsed);
  console.log('      Total Records Extracted:', output.totalRecordsExtracted);
  console.log('      Validation Status:', output.validationStatus);
  console.log('      Confidence Score:', Math.round(output.confidence * 100) + '%');

  console.log('\n2️⃣ AI Synthesized Summary & Answer:');
  console.log('   Executive Summary:', output.summary);
  console.log('   Recommendation:', output.recommendation);
  console.log('   Comparison Highlights:', JSON.stringify(output.comparison, null, 2));

  console.log('\n----------------------------------------------------');
  console.log('📊 Verification Summary');
  console.log('----------------------------------------------------');
  const goalsCount = await prisma.researchGoal.count();
  const collectorsCount = await prisma.collector.count();
  const runsCount = await prisma.scraperRun.count();
  const healingCount = await prisma.healingEvent.count();

  console.log(`Research Goals in DB: ${goalsCount}`);
  console.log(`Collectors in DB: ${collectorsCount}`);
  console.log(`Scraper Runs in DB: ${runsCount}`);
  console.log(`Healing Events in DB: ${healingCount}`);
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
