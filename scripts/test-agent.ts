import { executeAutonomousResearch } from '../lib/ai/agent';
import { prisma } from '../lib/database/prisma';

async function testQuery(prompt: string, stepNum: number) {
  console.log(`\n${stepNum}️⃣ Executing Autonomous Research for: "${prompt}"`);
  const output = await executeAutonomousResearch({ prompt, maxSourcesToProcess: 1 });

  console.log('   ✅ Execution Completed');
  console.log('      Confidence:', Math.round(output.confidence * 100) + '%');
  console.log('      Valid Records:', output.results.length);
  console.log('      Summary:', output.summary);
  console.log('      Recommendation:', output.recommendation);
  if (output.results.length > 0) {
    console.log('      Sample Result:', JSON.stringify(output.results[0]));
  }
}

async function main() {
  console.log('----------------------------------------------------');
  console.log('🤖 WebRescue — Comprehensive Research Agent Test');
  console.log('----------------------------------------------------');

  await testQuery('Find bike under 80,0000', 1);
  await testQuery('Find bikes under ₹80,000', 2);
  await testQuery('Find car under ₹80,000', 3);
  await testQuery('Find laptops under ₹80,000 with 16GB RAM and 512GB SSD.', 4);
  await testQuery('Find top technology stories on Hacker News.', 5);

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
