import { planResearchGoal } from '../lib/ai';
import { saveResearchGoalToDB, getAllResearchGoalsFromDB } from '../lib/ai/persistence';
import { prisma } from '../lib/database/prisma';

async function main() {
  console.log('----------------------------------------------------');
  console.log('🧠 WebRescue — Step 3 AI Goal Planner Test');
  console.log('----------------------------------------------------');

  const testPrompts = [
    'Find laptops under ₹80,000 with 16GB RAM and at least 512GB SSD.',
    'Search for mechanical keyboards under $150 with RGB lighting and hot-swappable switches.',
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n1️⃣ Testing Prompt ${i + 1}: "${prompt}"`);

    const plan = await planResearchGoal(prompt);
    console.log('   ✅ Structured Plan Generated:');
    console.log('      Entities:', plan.entities);
    console.log('      Fields:', plan.fields);
    console.log('      Constraints:', JSON.stringify(plan.constraints));

    const savedRecord = await saveResearchGoalToDB(plan);
    console.log('   💾 Saved to SQLite DB with ID:', savedRecord.id);
  }

  console.log('\n----------------------------------------------------');
  console.log('📊 Verification Summary');
  console.log('----------------------------------------------------');
  const allGoals = await getAllResearchGoalsFromDB();
  console.log(`Total Research Goals in DB: ${allGoals.length}`);
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
