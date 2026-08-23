import { orchestrateSelfHealing, formulateRepairPrompt } from '../lib/healing';
import { validateScrapedDataset } from '../lib/validator';
import { prisma } from '../lib/database/prisma';

async function main() {
  console.log('----------------------------------------------------');
  console.log('🔥 WebRescue — Step 8 Self-Healing Engine Test');
  console.log('----------------------------------------------------');

  // Construct broken validation report (5/42 prices = 12% completeness -> EXTRACTION_DRIFT)
  const brokenDataset = Array.from({ length: 42 }).map((_, i) => ({
    name: `Laptop Model #${i + 1}`,
    price: i < 5 ? 79999 : null,
    ram_gb: 16,
    storage_gb: 512,
  }));

  const validationReport = validateScrapedDataset(brokenDataset, {
    requiredFields: ['name', 'price', 'ram_gb', 'storage_gb'],
  });

  console.log('\n1️⃣ Testing Failure Prompt Formulation...');
  const prompt = formulateRepairPrompt(validationReport);
  console.log('   ✅ Formulated AI Repair Prompt:');
  console.log(`      "${prompt}"`);

  const realCollectorId = process.env.BRIGHTDATA_DEFAULT_COLLECTOR_ID || 'c_mt5uny9822ng9wnh';

  console.log('\n2️⃣ Testing Self-Healing Orchestration (Attempt 1)...');
  const result1 = await orchestrateSelfHealing({
    collectorId: realCollectorId,
    targetUrl: 'https://news.ycombinator.com',
    validationReport,
  });

  console.log('   Status:', result1.status);
  console.log('   Attempt Number:', result1.attemptsCount);
  console.log('   Details:', result1.details);
  console.log('   HealingEvent DB ID:', result1.healingEventId);

  console.log('\n3️⃣ Testing Self-Healing Orchestration (Attempt 2)...');
  const result2 = await orchestrateSelfHealing({
    collectorId: realCollectorId,
    targetUrl: 'https://news.ycombinator.com',
    validationReport,
  });
  console.log('   Status:', result2.status);
  console.log('   Attempt Number:', result2.attemptsCount);

  console.log('\n4️⃣ Testing Maximum Healing Loop Cap (Attempt 3 -> ESCALATED)...');
  const result3 = await orchestrateSelfHealing({
    collectorId: realCollectorId,
    targetUrl: 'https://news.ycombinator.com',
    validationReport,
  });
  console.log('   Status:', result3.status);
  console.log('   Attempt Number:', result3.attemptsCount);
  console.log('   Details:', result3.details);

  console.log('\n----------------------------------------------------');
  console.log('📊 Verification Summary');
  console.log('----------------------------------------------------');
  const healingEventsInDB = await prisma.healingEvent.findMany({
    where: { collectorId: realCollectorId },
  });
  console.log(`Total Healing Events registered in Prisma SQLite DB: ${healingEventsInDB.length}`);
  console.log('Latest Healing Status:', healingEventsInDB[healingEventsInDB.length - 1]?.status);
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
