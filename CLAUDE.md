# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MCP Server Integration

**CRITICAL: This project has MCP servers configured. Always use MCP tools instead of writing custom scripts or manual workarounds.**

### MongoDB MCP Server (`mcp__mongodb__*`)

**Purpose**: Direct AI-powered interaction with MongoDB databases without writing custom scripts.

**When to use**:

- Database exploration: listing databases, collections, schemas
- Data inspection: querying, counting, aggregating
- Schema analysis: understanding collection structure and indexes
- Performance analysis: explain plans, collection stats
- Database administration: viewing logs, stats, storage sizes

**DO NOT**:

- Write custom Node.js/TypeScript scripts for database inspection
- Use bash mongo/mongosh commands
- Create one-off query scripts

**Key tools** (prefix all with `mcp__mongodb__`):

- **Discovery**: `list-databases`, `list-collections`, `collection-schema`, `collection-indexes`
- **Querying**: `find`, `aggregate`, `count`, `explain`
- **Mutations**: `insert-many`, `update-many`, `delete-many` (use with caution)
- **Administration**: `db-stats`, `collection-storage-size`, `mongodb-logs`
- **Management**: `create-collection`, `drop-collection`, `rename-collection`

**Database**: `next_bruss_dev` (only database accessible via MCP)

**Security features**:

- Read-only mode available
- Confirmation required for destructive operations
- Tool disabling by category/operation type

### shadcn/ui MCP Server (`bunx shadcn@latest mcp`)

**Purpose**: Browse, search, and install shadcn/ui components using natural language.

**When to use**:

- Adding new UI components to the project
- Searching for available components across registries
- Installing blocks (dashboards, forms, calendars)
- Discovering component capabilities and dependencies

**DO NOT**:

- Manually copy component code from shadcn.com
- Run `bunx shadcn add` commands directly
- Create custom component installation scripts

**Key capabilities**:

- Natural language installation: "add a login form", "install a data table component"
- Multi-framework support: React (this project), Svelte, Vue
- Multi-registry support: Public, private, third-party registries
- Namespace support: `@registry/component-name` for private registries
- Accurate metadata: TypeScript props, React component data, dependencies

**Features (v4, 2025)**:

- Namespaced registries for company/internal components
- Component source code access (latest TypeScript)
- Demo implementations and usage patterns
- Blocks support for complete UI sections

### Context7 MCP Server (`mcp__context7__*`)

**Purpose**: Fetch up-to-date, version-specific library documentation and code examples directly from source.

**When to use**:

- Need current documentation for external libraries (Next.js, React, MongoDB driver, etc.)
- Want version-specific API references
- Avoid outdated training data or hallucinated APIs
- Get real code examples from official docs

**DO NOT**:

- Rely solely on training data for library-specific questions
- Guess API signatures for unfamiliar libraries

**Workflow**:

1. Call `mcp__context7__resolve-library-id` with library name (e.g., "next.js", "mongodb")
2. Get Context7-compatible library ID (format: `/org/project` or `/org/project/version`)
3. Call `mcp__context7__get-library-docs` with the library ID and optional topic

**Key tools**:

- `resolve-library-id`: Converts "mongodb" → `/mongodb/docs`
- `get-library-docs`: Fetches documentation for library ID with optional topic filter

**Benefits**:

- Version-specific accuracy (no outdated APIs)
- Official code examples
- Fast (milliseconds)

## Development Commands

```bash
# Development
bun install          # Install dependencies
bun dev             # Start dev server with Turbopack (http://localhost:3000)
bun build           # Production build with Turbopack
bun start           # Start production server

# Package Manager
# This project uses Bun, not npm or yarn
```

## Architecture Overview

### Application Structure

Next-Bruss is a dual-layout Next.js 15 manufacturing application with two distinct user experiences:

1. **Production Floor Apps (`/pro`)** - Minimal layout optimized for production floor terminals
   - DMCheck systems (dmcheck, dmcheck-2): Data Matrix Code scanning, box/pallet management, SMART API integration
   - Inventory (inw-2/spis): Real-time stock tracking with barcode scanning
   - Oven monitoring: Temperature tracking with process parameter management

2. **Office/Desk Apps (`/mgmt`)** - Full-featured layout for office-based work (used by all departments and regular employees, not just management)
   - Admin: User/article/employee configuration
   - Quality: Deviations, failures, CAPA tracking
   - Production: DMCheck data analytics, oven data charts, project management
   - HR: Overtime tracking and approval workflows
   - Tools: Code generators, inventory approval

### Internationalization

- All routes are under `[lang]` dynamic segment: `/[lang]/route-name`
- Supported locales: Polish (default), German, English, Tagalog, Ukrainian, Belarusian
- Middleware redirects locale-less URLs to appropriate locale
- Locale detection uses `@formatjs/intl-localematcher` with Accept-Language headers
- Dictionary pattern for translations in `app/dictionaries/`

### Database Architecture

**MongoDB (Primary)**

- Connection: `dbc('collection_name')` helper from `@/lib/mongo`
- Archive pattern: Important collections have `{collection}_archive` counterparts
- Key collections: `users`, `employees`, `oven_processes`, `oven_temperature_logs`, `scans`
- Global MongoDB client reused in development, new instance in production

**PostgreSQL (External)**

- Used for connecting to external databases
- Connection via `@/lib/pg`

### Authentication & Authorization

**NextAuth.js with LDAP**

- LDAP authentication via `ldapjs-client`
- Roles stored in MongoDB `users` collection
- Auto-creates user record on first login with default `['user']` role
- Role refresh interval: 1 hour (configurable via `SESSION_ROLES_REFRESH_INTERVAL`)
- Server actions pattern:
  ```typescript
  const session = await auth();
  if (!session?.user?.roles?.includes('required-role')) {
    return { error: 'unauthorized' };
  }
  ```

### State Management

**Zustand (Client State)**

- Per-application stores with persistence (localStorage)
- Located in `app/(pro|mgmt)/[lang]/{app}/lib/stores.ts`
- Naming: `{name}-application`, `{name}-operators`, `{name}-volume`
- Pattern: `create()(persist(...))`

**TanStack Query (Server State)**

- Server-side data fetching and caching
- DevTools available in development

**nuqs (URL State)**

- URL search params synchronization
- Wrapped in `NuqsProvider`

### Server Actions Pattern

**Location**: `actions.ts` files in route directories

**Standard Structure**:

```typescript
'use server';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';

export async function actionName(data: Type) {
  // 1. Authentication check
  const session = await auth();
  if (!session?.user?.roles?.includes('role')) {
    return { error: 'unauthorized' };
  }

  // 2. Validation (Zod schemas validated client-side, server validates again)
  const result = schema.safeParse(data);
  if (!result.success) {
    return { error: 'validation failed' };
  }

  // 3. Database operation
  const collection = await dbc('collection_name');
  // ... operation

  // 4. Cache revalidation
  revalidateTag('tag-name');

  // 5. Return result
  return { success: 'message' } | { error: 'message' };
}
```

**Return Conventions**:

- Success: `{ success: true }` or `{ success: data }`
- Error: `{ error: 'error-key' }` (i18n key or message)

### Form Handling

**React Hook Form + Zod**

- Schemas in `lib/zod.ts` or local `lib/zod.ts` files
- Client-side validation with `@hookform/resolvers/zod`
- Server-side re-validation in actions using `.safeParse()`

### UI Components

**shadcn/ui** (Radix UI primitives)

- Located in `components/ui/`
- Tailwind CSS v4 for styling
- `cn()` utility from `class-variance-authority` and `clsx`

### Path Aliases

```typescript
"@/*": ["./*"]  // Absolute imports from root
```

Usage: `import { dbc } from '@/lib/mongo'`

## Key Patterns & Conventions

### Component Defaults

- Server Components by default
- Add `'use client'` only when needed (hooks, events, browser APIs)

### Database Operations

- Always use `dbc('collection')` for MongoDB
- Check for archive collections when querying historical data
- Use `ObjectId` from `mongodb` for ID conversions

### Error Handling

- Server actions return `{ error: string }` objects
- Client components display errors using toast notifications (react-hot-toast, sonner)
- Never throw errors from server actions; return error objects

### Cache Invalidation

- Use `revalidateTag('tag-name')` after mutations
- Use `revalidatePath('/path')` for path-based revalidation
- Common tags match collection names or feature areas

### Code Generation & Barcodes

- `bwip-js` for barcode/DMC generation
- `qrcode` and `qrcode.react` for QR codes
- `@react-pdf/renderer` for PDF generation
- Paper sizes: 100x150mm (standard labels), 70x100mm (code generator)

### External Integrations

- **SMART API**: EOL validation endpoint for production parts
- **LDAP**: Enterprise authentication (configurable via env vars)
- **Email**: Nodemailer for notifications

### Environment Variables

Required variables:

```bash
MONGO_URI=                    # MongoDB connection string
PG_STRING=                    # PostgreSQL connection (legacy)
NEXTAUTH_URL=                 # Application URL
NEXTAUTH_SECRET=              # Auth secret
LDAP=                         # LDAP server URL
LDAP_DN=                      # LDAP bind DN
LDAP_PASS=                    # LDAP bind password
LDAP_BASE_DN=                 # LDAP search base DN
DEFAULT_LOCALE=               # Default locale (pl, de, en, tl, uk, be)
SESSION_ROLES_REFRESH_INTERVAL=  # Optional: role refresh interval (ms)
```

## Application-Specific Notes

### Oven Monitoring System

- Multi-sensor temperature tracking with outlier detection
- Process states: `prepared`, `running`, `finished`, `deleted`
- Program-based configuration: `oven_program_configs` → `oven_process_configs`
- Target parameters (temp, duration) saved at process creation time
- Temperature logs stored in `oven_temperature_logs` with process ID references

### DMCheck System

- Complete traceability: Part → Box → Pallet
- SMART API integration for EOL validation
- Data Matrix Code (DMC) scanning with validation
- Operator accountability tracking
- Real-time quality metrics

### Archive Pattern

- Completed/historical records moved to `{collection}_archive`
- Query both collections when showing historical data
- Archive operations typically soft-delete with status changes

## Recent Development Focus

Recent commits show work on:

- 70x100mm paper size support for code generator
- Temperature system improvements with quartile calculation refinement
- Locale validation improvements in middleware
- Process status and collection name constant cleanup
