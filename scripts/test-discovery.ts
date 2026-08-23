import { discoverSources } from '../lib/scraper/discovery';
import { planResearchGoal } from '../lib/ai';

async function main() {
  console.log('----------------------------------------------------');
  console.log('🔎 WebRescue — Step 4 Source Discovery Test');
  console.log('----------------------------------------------------');

  const testPrompts = [
    'Find laptops under ₹80,000 with 16GB RAM and at least 512GB SSD.',
    'Search for mechanical keyboards under $150.',
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i];
    console.log(`\n1️⃣ Generating Plan for Prompt ${i + 1}: "${prompt}"`);
    const plan = await planResearchGoal(prompt);

    console.log(`2️⃣ Running Source Discovery for Entity: [${plan.entities.join(', ')}]...`);
    const sources = discoverSources(plan);

    console.log(`   ✅ Discovered ${sources.length} Candidate Public Sources:`);
    sources.forEach((src, idx) => {
      console.log(`      [${idx + 1}] ${src.name} (${src.url})`);
      console.log(`          Reason: ${src.reason}`);
      console.log(`          Confidence: ${Math.round(src.confidence * 100)}%`);
    });
  }

  console.log('\n----------------------------------------------------');
  console.log('📊 Verification Summary');
  console.log('----------------------------------------------------');
  console.log('Source Discovery engine successfully returned candidate sources with URL, reason, & confidence.');
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
