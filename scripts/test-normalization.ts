import { normalizeScrapedData } from '../lib/scraper/normalizer';
import { saveScraperRunToDB, getRecentScraperRunsFromDB } from '../lib/scraper';
import { prisma } from '../lib/database/prisma';

async function main() {
  console.log('----------------------------------------------------');
  console.log('📊 WebRescue — Step 6 Data Extraction & Normalization Test');
  console.log('----------------------------------------------------');

  const sampleRawOutputs = [
    {
      name: 'MacBook Air M3',
      price: '₹94,900',
      ram: '16 GB RAM',
      storage: '512GB SSD',
      rating: '4.8 out of 5 stars',
      discount: '10% off',
    },
    {
      name: 'Dell XPS 15',
      price: '$1,899.99',
      ram: '32GB RAM',
      storage: '1TB SSD',
      rating: '4.6/5',
    },
  ];

  console.log('\n1️⃣ Running Generic Normalizer Engine...');
  const normalized = normalizeScrapedData(sampleRawOutputs);

  console.log('   Raw Output 1:', JSON.stringify(sampleRawOutputs[0]));
  console.log('   ✨ Normalized 1:', JSON.stringify(normalized[0], null, 2));

  console.log('\n2️⃣ Persisting Raw + Normalized ScraperRun to SQLite DB...');
  const runRecord = await saveScraperRunToDB({
    collectorId: 'c_normalizer_test_001',
    status: 'SUCCESS',
    rawData: sampleRawOutputs,
    normalizedData: normalized,
  });

  console.log('   ✅ Saved ScraperRun ID:', runRecord.id);

  console.log('\n----------------------------------------------------');
  console.log('📊 Verification Summary');
  console.log('----------------------------------------------------');
  const runs = await getRecentScraperRunsFromDB();
  console.log(`Total Scraper Runs in Prisma SQLite DB: ${runs.length}`);
  console.log('Latest Run Status:', runs[0].status);
  console.log('----------------------------------------------------\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in test script:', err);
    process.exit(1);
  });
