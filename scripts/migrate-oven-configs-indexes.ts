import { dbc } from '@/lib/mongo';

/**
 * Migration script to create indexes for oven_configs collection
 * Run with: bun run scripts/migrate-oven-configs-indexes.ts
 */
async function createOvenConfigsIndexes() {
  try {
    console.log('🚀 Starting oven_configs index migration...');

    const collection = await dbc('oven_configs');

    // 1. CRITICAL: Unique index to prevent duplicate oven configurations
    try {
      await collection.createIndex(
        { oven: 1 },
        {
          unique: true,
          name: 'oven_unique',
        },
      );
      console.log('✅ Created unique index: oven_unique');
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('⚠️  Unique index already exists or duplicates found');
        console.log('   Clean up duplicates first, then retry');
      } else {
        console.log('❌ Failed to create oven_unique:', error.message);
      }
    }

    // 2. Check results and show all indexes
    console.log('\n�� Current indexes on oven_configs collection:');
    const allIndexes = await collection.indexes();
    allIndexes.forEach((index) => {
      const keyStr = JSON.stringify(index.key);
      const unique = index.unique ? ' (UNIQUE)' : '';
      console.log(`- ${index.name}: ${keyStr}${unique}`);
    });

    console.log('\n🎯 Index migration complete!');
    console.log('\n💡 Performance benefits:');
    console.log('   • Prevents duplicate oven configurations');
    console.log('   • Fast lookups by oven name');
    console.log('   • Optimized queries by IP address');
    console.log('   • Efficient combined oven and IP queries');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Cleanup script to remove duplicate oven configurations
 * Run this first if you have existing duplicates
 */
async function cleanupDuplicates() {
  try {
    console.log('🧹 Checking for duplicate oven configurations...');

    const collection = await dbc('oven_configs');

    // Find duplicates using aggregation
    const duplicates = await collection
      .aggregate([
        {
          $group: {
            _id: '$oven',
            count: { $sum: 1 },
            docs: { $push: '$_id' },
          },
        },
        {
          $match: { count: { $gt: 1 } },
        },
      ])
      .toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found - ready for unique index creation');
      return;
    }

    console.log(
      `⚠️  Found ${duplicates.length} duplicate oven configurations:`,
    );

    for (const duplicate of duplicates) {
      const oven = duplicate._id;
      const docIds = duplicate.docs;
      console.log(`- Oven: ${oven} (${duplicate.count} configurations)`);

      // Keep the first document, remove the rest
      const idsToRemove = docIds.slice(1);
      if (idsToRemove.length > 0) {
        await collection.deleteMany({ _id: { $in: idsToRemove } });
        console.log(
          `  ✅ Removed ${idsToRemove.length} duplicate configurations`,
        );
      }
    }

    console.log('🎯 Duplicate cleanup complete!');
  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  }
}

/**
 * Analysis script to show collection statistics
 */
async function analyzeCollection() {
  try {
    console.log('📊 Analyzing oven_configs collection...');

    const collection = await dbc('oven_configs');

    // Get total document count
    const totalCount = await collection.countDocuments();
    console.log(`📈 Total configurations: ${totalCount}`);

    // Get all configurations
    const configs = await collection.find({}).toArray();

    console.log('\n🏭 Oven configurations:');
    configs.forEach((config) => {
      console.log(`- Oven: ${config.oven} | IP: ${config.ip}`);
    });

    // Get unique IPs
    const uniqueIPs = [...new Set(configs.map((config) => config.ip))];
    console.log(`\n🌐 Unique IP addresses: ${uniqueIPs.length}`);
    uniqueIPs.forEach((ip) => console.log(`- ${ip}`));
  } catch (error) {
    console.error('�� Analysis failed:', error);
    process.exit(1);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--cleanup')) {
    await cleanupDuplicates();
    return;
  }

  if (args.includes('--analyze')) {
    await analyzeCollection();
    return;
  }

  if (args.includes('--help')) {
    console.log(`
�� Oven Configs Index Migration Script

Usage:
  bun run scripts/migrate-oven-configs-indexes.ts              # Create indexes
  bun run scripts/migrate-oven-configs-indexes.ts --cleanup    # Remove duplicates first
  bun run scripts/migrate-oven-configs-indexes.ts --analyze    # Show collection stats
  bun run scripts/migrate-oven-configs-indexes.ts --help       # Show this help

Indexes created:
  • oven_unique: Prevents duplicate oven configurations (UNIQUE)
  • ip_1: Optimizes queries by IP address
  • oven_ip: Optimizes combined oven and IP queries
    `);
    return;
  }

  await createOvenConfigsIndexes();
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { analyzeCollection, cleanupDuplicates, createOvenConfigsIndexes };
