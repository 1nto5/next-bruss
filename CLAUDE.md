# CLAUDE.md

Manufacturing app: Next.js 15 + Turbopack + TypeScript + Bun + MongoDB + LDAP

## Tech Stack

Next.js 15 (App Router) • TypeScript • Bun • Tailwind v4 • shadcn/ui  
MongoDB • NextAuth v5 + LDAP  
Zustand • TanStack Query • nuqs • React Hook Form + Zod  
i18n - multilingual

## CRITICAL: Next.js 15 Breaking Changes

### Caching - BIGGEST CHANGE

```typescript
// ❌ Nothing cached by default anymore (vs Next.js 14)
// ✅ Explicitly opt-in
fetch(url, { cache: 'force-cache', next: { revalidate: 3600 } })

// ✅ ALWAYS revalidate after mutations
revalidatePath('/path') // or revalidateTag('tag')
```

## MCP Servers (Use Instead of Custom Scripts)

### MongoDB MCP - `mcp__mongodb__*`

**When**: ALL database operations on `next_bruss_dev`

Key tools: `find`, `aggregate`, `insert-many`, `list-collections`, `collection-schema`

```typescript
// ✅ DO: Use MCP
mcp__mongodb__find({ collection: 'users', query: { role: 'admin' } })

// ❌ DON'T: Write Node.js scripts or bash mongosh
```

Security: Read-only by default. Mutations need confirmation.

### shadcn/ui MCP - `bunx shadcn@latest mcp`

**When**: Installing UI components

Natural language: "add a data table" → auto-installs component

❌ Don't manually copy from shadcn.com

### Context7 MCP - `mcp__context7__*`

**When**: Need current library docs (Next.js, React, MongoDB)

Workflow: `resolve-library-id("mongodb")` → `get-library-docs(id, topic)`

## Dual-Layout Architecture

### /pro - Production Floor (Touch-First)

```typescript
// ✅ ALWAYS: Large targets (≥48px), high contrast, font ≥18px, max 2 nav levels
// ❌ NEVER: Small text, keyboard-required, complex forms
```

Apps: `dmcheck-2`, `inw-2/spis`, `oven`  
Users: Operators on shop floor terminals

### /mgmt - Office/Management (Desktop)

```typescript
// ✅ PREFER: Data tables, complex forms, analytics, keyboard shortcuts
```

Apps: admin, quality, production, hr, tools  
Users: Managers, planners, engineers

## Routes

```
app/
├── (pro)/[lang]/
│   ├── dmcheck/
│   ├── inw-2/
│   └── oven/
└── (mgmt)/[lang]/
    ├── admin/
    ├── quality/
    ├── production/
    ├── hr/
    └── tools/
```

## Database

### MongoDB (Primary)

````typescript
import { dbc } from '@/lib/mongo'

const collection = await dbc('collection_name')
const data = await collection.findOne({ _id: new ObjectId(id) })

## State Management

```typescript
// URL (shareable) - useQueryState from nuqs
// Server (API) - useQuery from TanStack Query
// Global Client - Zustand stores in lib/stores.ts
// Local UI - useState
````

## Top 10 Gotchas

1. **❌ fetch from Route Handlers** → ✅ Direct DB access in Server Components
2. **❌ Missing revalidation** → ✅ Always `revalidatePath()` after mutations
3. **❌ 'use client' too high** → ✅ Extract to smallest component
4. **❌ Ignoring archive collections** → ✅ Query both `_archive` and current
5. **❌ Hardcoded text** → ✅ Use i18n dictionary
6. **❌ Passing functions Server→Client** → ✅ Use Server Actions
7. **❌ Not awaiting cookies/headers** → ✅ `await cookies()` in Next.js 15

## Commands

```bash
bun dev           # Dev with Turbopack
bun build         # Production build
bun start         # Start production

# ❌ DON'T use npm/yarn
```

## Path Aliases

```typescript
import { dbc } from '@/lib/mongo'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { getDictionary } from '@/app/dictionaries'
```

---

**Default**: Server Components. Add `'use client'` only for hooks/events. Always revalidate. Test both locales.
