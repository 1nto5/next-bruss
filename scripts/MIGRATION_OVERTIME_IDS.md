# Migration: Assign Internal IDs to Overtime Orders

## Purpose

Assigns unique IDs (format `N/YY`) to all overtime orders in chronological order.

## When to Use

- **After renaming collection** in production
- When entries exist without `internalId`
- When you want to renumber all IDs chronologically

## ID Format

```
N/YY
```

- **N** = sequential number (1, 2, 3, ...)
- **YY** = last 2 digits of year from `requestedAt` field

### Examples:
- `1/25` = oldest entry from 2025
- `103/25` = 103rd entry from 2025 (newest)

## How to Use

### 1. Preparation

Open `scripts/assign-overtime-internal-ids.ts` and configure:

```typescript
const YEAR_TO_MIGRATE = 2025; // Change to the year you want to migrate
```

**IMPORTANT:** Update the collection name if needed:
```typescript
const collection = await dbc('overtime_orders'); // Change to your collection name in production
```

### 2. Test in Development Environment

**ALWAYS** test on development database first:

```bash
bun run scripts/assign-overtime-internal-ids.ts
```

### 3. Run in Production

**WARNING:** Always backup database before running!

```bash
# On production server:
bun run scripts/assign-overtime-internal-ids.ts
```

## What the Script Does

1. ✅ Fetches **ALL** entries from specified year
2. ✅ Sorts chronologically (oldest → newest)
3. ✅ Assigns sequential IDs: older entries = lower numbers
4. ✅ Shows preview before execution
5. ✅ Waits 5 seconds for cancellation (Ctrl+C)
6. ✅ Updates database
7. ✅ Shows summary and verification

## Example Output

```
🚀 Starting overtime orders ID migration for year 2025...

📊 Found 103 entries from 2025

📅 Date range:
   Oldest:  2.07.2025, 10:35:36
   Newest:  1.10.2025, 14:36:29

📋 Current state:
   Entries with IDs:    4
   Entries without IDs: 99

📋 Preview of ID assignments (first 10 and last 10):
──────────────────────────────────────────────────────────────
  Old ID      →  New ID      Date
──────────────────────────────────────────────────────────────
  null        →  1/25        2.07.2025, 10:35:36
  null        →  2/25        2.07.2025, 10:36:32
  ...
  4/25        →  103/25      1.10.2025, 14:36:29
──────────────────────────────────────────────────────────────

⚠️  WARNING: This will permanently modify the database!
⚠️  WARNING: 4 existing IDs will be changed!

Press Ctrl+C to cancel or wait 5 seconds to continue...
```

## IMPORTANT - Remember

### ⚠️ Backup

**ALWAYS** backup database before running in production:

```bash
# MongoDB backup
mongodump --db next_bruss_prod --collection overtime_orders --out backup_$(date +%Y%m%d)
```

### ⚠️ Existing IDs

Script will **RENUMBER ALL IDs**, including existing ones!

If you have entries with existing IDs and want to preserve them:
1. Don't run this script
2. Or modify the code to skip entries with IDs

### ⚠️ References

Check if other collections have references to `internalId`!

If yes, you **must update** those references after migration.

### ⚠️ Cache

After production migration:
- Clear application cache
- Restart Next.js server
- Verify everything works correctly

## Post-Migration Verification

```bash
# Check if all entries have IDs
mongosh next_bruss_prod --eval "db.overtime_orders.countDocuments({internalId: null})"
# Should return: 0

# Check ID range
mongosh next_bruss_prod --eval "db.overtime_orders.find({}, {internalId: 1, requestedAt: 1}).sort({requestedAt: 1}).limit(1)"
mongosh next_bruss_prod --eval "db.overtime_orders.find({}, {internalId: 1, requestedAt: 1}).sort({requestedAt: -1}).limit(1)"
```

## Rollback

If something goes wrong:

```bash
# Restore from backup
mongorestore --db next_bruss_prod --collection overtime_orders backup_YYYYMMDD/next_bruss_prod/overtime_orders.bson --drop
```

## Troubleshooting

### Problem: "Error connecting to database"
**Solution:** Check environment variables (`.env.production`)

### Problem: Script hangs
**Solution:** Increase timeout in MongoDB configuration

### Problem: Duplicate IDs
**Solution:** This shouldn't happen - script assigns unique sequential numbers

---

**Created:** 2025-10-02
**Version:** 1.0
