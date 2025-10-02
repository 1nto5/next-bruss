import { dbc } from '@/lib/mongo';

/**
 * Production Migration Script: Assign internalId to overtime orders
 *
 * Purpose: Assigns sequential IDs to all overtime orders in chronological order
 *
 * Format: "N/YY" where:
 * - N is sequential number (1, 2, 3, ...)
 * - YY is 2-digit year from requestedAt date
 *
 * Strategy:
 * 1. Fetch ALL entries from specified year
 * 2. Sort by requestedAt (oldest first)
 * 3. Assign IDs: oldest entry = 1/YY, newest entry = N/YY
 *
 * IMPORTANT: This will renumber ALL entries, including those that already have IDs!
 */

const YEAR_TO_MIGRATE = 2025; // Change this to the year you want to migrate

async function assignOvertimeInternalIds() {
  console.log(`🚀 Starting overtime orders ID migration for year ${YEAR_TO_MIGRATE}...\n`);

  try {
    const collection = await dbc('overtime_orders');

    // Get ALL entries from the specified year, sorted by requestedAt ASCENDING
    const entries = await collection
      .find({
        requestedAt: {
          $gte: new Date(`${YEAR_TO_MIGRATE}-01-01`),
          $lt: new Date(`${YEAR_TO_MIGRATE + 1}-01-01`),
        },
      })
      .sort({ requestedAt: 1 }) // Oldest first = lower IDs
      .toArray();

    console.log(`📊 Found ${entries.length} entries from ${YEAR_TO_MIGRATE}\n`);

    if (entries.length === 0) {
      console.log('✅ No entries found for this year. Exiting.');
      return;
    }

    // Show date range
    console.log(`📅 Date range:`);
    console.log(`   Oldest:  ${new Date(entries[0].requestedAt).toLocaleString('pl-PL')}`);
    console.log(`   Newest:  ${new Date(entries[entries.length - 1].requestedAt).toLocaleString('pl-PL')}\n`);

    // Count entries with and without existing IDs
    const withIds = entries.filter(e => e.internalId).length;
    const withoutIds = entries.filter(e => !e.internalId).length;

    console.log(`📋 Current state:`);
    console.log(`   Entries with IDs:    ${withIds}`);
    console.log(`   Entries without IDs: ${withoutIds}\n`);

    // Prepare updates
    const yearShort = YEAR_TO_MIGRATE.toString().slice(-2);
    const updates = entries.map((entry, index) => ({
      _id: entry._id,
      oldInternalId: entry.internalId || null,
      newInternalId: `${index + 1}/${yearShort}`,
      requestedAt: entry.requestedAt,
    }));

    // Show preview
    console.log('📋 Preview of ID assignments (first 10 and last 10):');
    console.log('─'.repeat(90));
    console.log('  Old ID      →  New ID      Date                     MongoDB _id');
    console.log('─'.repeat(90));

    const preview = [
      ...updates.slice(0, 10),
      ...(updates.length > 20 ? [{ _id: '...', oldInternalId: '...', newInternalId: '...', requestedAt: '...' }] : []),
      ...updates.slice(-10),
    ];

    preview.forEach((update) => {
      if (update._id === '...') {
        console.log('  ...');
      } else {
        const date = new Date(update.requestedAt).toLocaleString('pl-PL');
        const oldId = (update.oldInternalId || 'null').toString().padEnd(12);
        const newId = update.newInternalId.padEnd(12);
        console.log(`  ${oldId}→  ${newId}${date.padEnd(24)} ${update._id}`);
      }
    });

    console.log('─'.repeat(90));
    console.log(`\n📊 Migration summary:`);
    console.log(`   Total entries:  ${updates.length}`);
    console.log(`   ID range:       ${updates[0].newInternalId} (oldest) → ${updates[updates.length - 1].newInternalId} (newest)`);
    console.log('\n⚠️  WARNING: This will permanently modify the database!');
    if (withIds > 0) {
      console.log(`⚠️  WARNING: ${withIds} existing IDs will be changed!`);
    }
    console.log('\nPress Ctrl+C to cancel or wait 5 seconds to continue...\n');

    // Safety delay
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log('🔄 Executing migration...\n');

    // Perform updates
    let updated = 0;
    for (const update of updates) {
      await collection.updateOne(
        { _id: update._id },
        { $set: { internalId: update.newInternalId } }
      );
      updated++;

      if (updated % 10 === 0 || updated === updates.length) {
        console.log(`  Updated ${updated}/${updates.length} entries...`);
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Updated ${updated} entries`);
    console.log(`📈 New IDs: ${updates[0].newInternalId} (oldest) → ${updates[updates.length - 1].newInternalId} (newest)\n`);

    // Verification
    console.log('✓ Verification sample (first 5 and last 5):');
    console.log('─'.repeat(70));
    [...updates.slice(0, 5), ...updates.slice(-5)].forEach((update) => {
      const date = new Date(update.requestedAt).toLocaleDateString('pl-PL');
      const wasText = update.oldInternalId ? `was: ${update.oldInternalId}` : 'was: null';
      console.log(`  ${update.newInternalId.padEnd(10)} ${date.padEnd(15)} (${wasText})`);
    });
    console.log('─'.repeat(70));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Execute migration
assignOvertimeInternalIds()
  .then(() => {
    console.log('\n🎉 Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
