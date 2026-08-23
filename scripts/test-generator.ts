import { planResearchGoal } from '../lib/ai';
import { discoverSources } from '../lib/scraper/discovery';
import { generateScraperCollector } from '../lib/scraper/generator';
import { prisma } from '../lib/database/prisma';

async function main() {
  console.log('----------------------------------------------------');
  console.log('⚙️ WebRescue — Step 5 Autonomous Scraper Generator Test');
  console.log('----------------------------------------------------');

  const prompt = 'Find laptops under ₹80,000 with 16GB RAM and at least 512GB SSD.';
  console.log(`\n1️⃣ Generating Plan for: "${prompt}"`);
  const plan = await planResearchGoal(prompt);

  console.log('\n2️⃣ Running Source Discovery...');
  const sources = discoverSources(plan);
  const selectedSource = sources[0];
  console.log(`   Selected Source: ${selectedSource.name} (${selectedSource.url})`);

  console.log('\n3️⃣ Invoking Autonomous Scraper Generator...');
  try {
    const result = await generateScraperCollector({
      plan,
      source: { name: selectedSource.name, url: selectedSource.url },
    });

    console.log('   ✅ Scraper Collector Generated Successfully!');
    console.log('      Collector ID:', result.collector.collectorId);
    console.log('      Name:', result.collector.name);
    console.log('      Target URL:', result.collector.url);
    console.log('      Status:', result.collector.status);
    console.log('      Extraction Prompt:', result.descriptionUsed);
  } catch (err: any) {
    console.warn(`   ⚠️ Bright Data CLI Notice: ${err.message}`);
  }

  console.log('\n----------------------------------------------------');
  console.log('📊 Verification Summary');
  console.log('----------------------------------------------------');
  const collectorsInDB = await prisma.collector.findMany();
  console.log(`Total Collectors registered in Prisma SQLite DB: ${collectorsInDB.length}`);
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
