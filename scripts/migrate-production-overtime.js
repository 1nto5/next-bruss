// Migration script: production_overtime → overtime_orders
// Run with: node scripts/migrate-production-overtime.js

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.development' });

async function migrate() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('next_bruss_dev');
    const productionOvertimeColl = db.collection('production_overtime');
    const overtimeOrdersColl = db.collection('overtime_orders');

    // 1. Count records
    const countOld = await productionOvertimeColl.countDocuments();
    const countExisting = await overtimeOrdersColl.countDocuments({ _migratedFrom: 'production_overtime' });

    console.log(`📊 production_overtime: ${countOld} documents`);
    console.log(`📊 Already migrated: ${countExisting} documents`);

    if (countExisting > 0) {
      console.log('⚠️  Migration already partially done. Skipping...');
      return;
    }

    // 2. Fetch all records from production_overtime
    const oldRecords = await productionOvertimeColl.find().toArray();
    console.log(`📥 Fetched ${oldRecords.length} records from production_overtime`);

    // 3. Transform and insert to overtime_orders
    const migratedRecords = oldRecords.map(record => ({
      // Keep original fields
      _id: record._id,
      status: record.status,
      numberOfEmployees: record.numberOfEmployees,
      numberOfShifts: record.numberOfShifts || 1,
      responsibleEmployee: record.responsibleEmployee,
      employeesWithScheduledDayOff: record.employeesWithScheduledDayOff || [],
      from: record.from,
      to: record.to,
      reason: record.reason || '',
      note: record.note || '',
      requestedAt: record.requestedAt,
      requestedBy: record.requestedBy,
      editedAt: record.editedAt,
      editedBy: record.editedBy,
      approvedAt: record.approvedAt,
      approvedBy: record.approvedBy,
      completedAt: record.completedAt,
      completedBy: record.completedBy,
      canceledAt: record.canceledAt,
      canceledBy: record.canceledBy,
      hasAttachment: record.hasAttachment,
      attachmentFilename: record.attachmentFilename,
      accountedAt: record.accountedAt,
      accountedBy: record.accountedBy,

      // Add missing fields (compatibility with new system)
      department: record.department || 'production', // ⚠️ KEY: default to production
      plannedArticles: record.plannedArticles || [],
      actualArticles: record.actualArticles || [],
      internalId: record.internalId || null,
      actualEmployeesWorked: record.actualEmployeesWorked,

      // Mark as migrated
      _migratedFrom: 'production_overtime',
      _migratedAt: new Date()
    }));

    // 4. Insert in batches (safer)
    console.log(`📤 Inserting ${migratedRecords.length} records to overtime_orders...`);
    const result = await overtimeOrdersColl.insertMany(migratedRecords, { ordered: false });

    console.log(`✅ Migration complete: ${result.insertedCount} records inserted`);

    // 5. Verification
    const verifyCount = await overtimeOrdersColl.countDocuments({
      _migratedFrom: 'production_overtime',
      department: 'production'
    });
    console.log(`✅ Verification: ${verifyCount} records with department='production'`);

    // 6. Check for duplicates
    const duplicates = await overtimeOrdersColl.aggregate([
      { $group: { _id: '$_id', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    if (duplicates.length > 0) {
      console.error('❌ DUPLICATES FOUND:', duplicates);
    } else {
      console.log('✅ No duplicate _id found');
    }

    console.log('\n📋 Summary:');
    console.log(`   - Total migrated: ${result.insertedCount}`);
    console.log(`   - Department=production: ${verifyCount}`);
    console.log(`   - Next step: Rename production_overtime → production_overtime_archive`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
}

migrate().catch(console.error);
