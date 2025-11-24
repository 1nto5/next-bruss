- Adapt the inventory approval application to narrow screens, similar to the inventory floor application
- tylko nadgodziny w overtime-submissions
- filtrowanie po ID w overtime-submissions
- dodawanie zleceń przez hr

## Performance Optimizations to Apply Globally

**Implemented in:** `app/[lang]/dmcheck-data/`
**To apply in:** overtime-orders, overtime-submissions, oven-data, production-overtime, failures, deviations, etc.

### 1. Extract Data Fetchers to lib/

- Move inline async data fetching from page.tsx to lib/get-\*.ts files
- Benefits: better organization, reusability, easier testing
- Example: `lib/get-articles.ts`, `lib/get-scans.ts`

### 2. Extract Utilities to lib/utils.ts

- Move reusable helper functions to shared utility file
- Benefits: DRY principle, consistent behavior across components
- Example: `getValueCount()`, `getOneWeekAgo()`, `getToday()`

### 3. Add useCallback for Event Handlers

- Wrap event handlers in useCallback to prevent unnecessary re-renders
- Especially important for handlers passed as props to child components
- Example: `handleSearchClick`, `handleClearFilters`, `handleExportClick`

### 4. Add useMemo for Expensive Computations

- Wrap computed values in useMemo to cache results between renders
- Target: array operations (filter, map, reduce, sort)
- Example: `workplaceOptions`, `articleOptions`, `defectOptions`

### 5. Add Default Date Ranges

- Provide sensible defaults for date filters (1 week ago - today)
- Improves UX - users see data immediately instead of empty table
- Example: `fromFilter` defaults to `getOneWeekAgo()`, `toFilter` to `getToday()`

### 6. Fix Hardcoded Strings

- Replace all hardcoded UI strings with dictionary references
- Ensures proper i18n/l10n support
- Example: "No results" → `{dict.table.noResults}`
