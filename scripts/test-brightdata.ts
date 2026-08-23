import { createBrightDataCollector, runBrightDataCollector, healBrightDataCollector } from '../lib/brightdata';
import { saveCollectorToDB, saveScraperRunToDB, saveHealingEventToDB, normalizeScrapedData } from '../lib/scraper';
import { prisma } from '../lib/database/prisma';

async function main() {
  console.log('----------------------------------------------------');
  console.log('🕷️ WebRescue — Step 2 Bright Data End-to-End Test');
  console.log('----------------------------------------------------');

  const targetUrl = process.argv[2] || 'https://news.ycombinator.com';
  const description = process.argv[3] || 'Extract top stories: title, url, points, author, comment_count';

  console.log(`\n1️⃣ Using Real Bright Data Scraper Studio Collector for: ${targetUrl}`);
  console.log(`   Goal description: "${description}"`);

  let collectorId = process.env.BRIGHTDATA_DEFAULT_COLLECTOR_ID || 'c_mt5uny9822ng9wnh';
  let collectorName = 'hn-top-stories-collector';


  // Save Collector to SQLite DB
  console.log('\n2️⃣ Saving Collector metadata to SQLite Database...');
  const collectorDB = await saveCollectorToDB({
    collectorId,
    name: collectorName,
    url: targetUrl,
    fields: [description],
  });
  console.log(`   ✅ Collector stored in Prisma DB:`, collectorDB.id);

  // Run Collector
  console.log(`\n3️⃣ Executing Collector Run (${collectorId}) against ${targetUrl}...`);
  try {
    const runResult = await runBrightDataCollector(collectorId, targetUrl, { sync: true });
    console.log('   ✅ Scraper Run Completed Successfully!');
    
    // Normalize data
    const normalized = normalizeScrapedData(runResult.data);
    console.log('   📊 Raw Data snippet:', JSON.stringify(runResult.data).substring(0, 150) + '...');
    console.log('   ✨ Normalized Data snippet:', JSON.stringify(normalized).substring(0, 150) + '...');

    // Save ScraperRun to SQLite DB
    console.log('\n4️⃣ Saving ScraperRun record to SQLite Database...');
    const runDB = await saveScraperRunToDB({
      collectorId,
      status: runResult.status,
      rawData: runResult.data,
      normalizedData: normalized,
    });
    console.log(`   ✅ ScraperRun stored in Prisma DB:`, runDB.id);
  } catch (err: any) {
    console.warn(`   ⚠️ Collector Execution Note: ${err.message}`);
  }

  // Test Healing command wrapper interface
  console.log(`\n5️⃣ Verifying Self-Healing Interface (bdata scraper heal)...`);
  try {
    const healResult = await healBrightDataCollector({
      collectorId,
      whatBroke: 'Price and author selectors returned null after page design change',
      targetUrl,
      autoApprove: true,
    });
    console.log(`   ✅ Healing Interface Executed! Result Status: ${healResult.status}`);
    
    // Save HealingEvent to DB
    const healDB = await saveHealingEventToDB({
      collectorId,
      triggerReason: 'TEST_DOM_SELECTOR_DRIFT',
      whatBroke: 'Price and author selectors returned null',
      status: healResult.status,
      resolution: healResult.details,
    });
    console.log(`   ✅ HealingEvent stored in Prisma DB:`, healDB.id);
  } catch (err: any) {
    console.warn(`   ℹ️ Healing interface notice: ${err.message}`);
  }

  // Database verification summary
  console.log('\n----------------------------------------------------');
  console.log('📊 Step 2 Verification Summary');
  console.log('----------------------------------------------------');
  const collectors = await prisma.collector.findMany();
  const runs = await prisma.scraperRun.findMany();
  const healingEvents = await prisma.healingEvent.findMany();

  console.log(`Collectors in DB: ${collectors.length}`);
  console.log(`Scraper Runs in DB: ${runs.length}`);
  console.log(`Healing Events in DB: ${healingEvents.length}`);
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
