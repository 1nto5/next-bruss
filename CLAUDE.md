# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with Turbopack
bun dev

# Production build with Turbopack
bun build

# Start production server
bun start

```

## MCP Server Tools

This Claude Code instance has access to several MCP (Model Context Protocol) servers that provide enhanced capabilities for development, testing, and debugging.

### MCP Playwright Testing

The integrated Playwright MCP server provides browser automation capabilities for end-to-end testing.

**Key Functions:**

- `mcp__playwright__browser_navigate` - Navigate to URLs for testing
- `mcp__playwright__browser_snapshot` - Capture page state for analysis
- `mcp__playwright__browser_click` - Interact with page elements
- `mcp__playwright__browser_type` - Fill forms and input fields
- `mcp__playwright__browser_take_screenshot` - Visual testing and debugging

**Common Testing Patterns:**

```typescript
// E2E testing workflow example
1. Navigate to application page
2. Take snapshot to analyze page structure
3. Fill forms and interact with elements
4. Verify expected outcomes
5. Take screenshots for visual verification
```

**Best Practices:**

- Use snapshots before actions to understand page structure
- Take screenshots for debugging failed tests
- Test critical user flows (authentication, data entry, navigation)
- Verify multi-language interface functionality

**Automated Server Check Pattern:**

```typescript
// When using Playwright MCP tools, first verify server availability
1. Check if localhost:3000 is accessible
2. If not accessible, start development server with 'bun dev'
3. Wait for server to respond before proceeding with tests
4. Navigate to application and continue with test workflow
```

### MCP MongoDB Database Operations

The MongoDB MCP server provides direct database access and inspection capabilities.

**Key Functions:**

- `mcp__mongodb__connect` - Connect to MongoDB instances
- `mcp__mongodb__find` - Query collections with filters and projections
- `mcp__mongodb__collection-schema` - Analyze collection structure
- `mcp__mongodb__count` - Get document counts with optional filters
- `mcp__mongodb__aggregate` - Run aggregation pipelines

**When to Use MCP vs Standard Connection:**

- **Use `dbc()` pattern** for application code and server actions
- **Use MCP MongoDB** for debugging, data inspection, and analysis
- **Use MCP MongoDB** when you need to explore unfamiliar collections
- **Use MCP MongoDB** for complex aggregation pipeline development

**Common Operations:**

```typescript
// Data inspection and debugging workflow
1. Connect to database
2. List collections and analyze schemas
3. Query data with filters to understand structure
4. Count documents to verify data integrity
5. Run aggregations for complex data analysis
```

### MCP Context7 Documentation

The Context7 MCP server provides access to up-to-date documentation for libraries and frameworks.

**Key Functions:**

- `mcp__context7__resolve-library-id` - Find correct library identifiers
- `mcp__context7__get-library-docs` - Retrieve current documentation

**When to Use Context7:**

- When you need the latest API documentation for a library
- When working with recently updated frameworks or packages
- When existing knowledge might be outdated
- When looking for specific implementation examples

**Common Libraries to Query:**

- Next.js (`/vercel/next.js`)
- React documentation
- MongoDB driver documentation
- shadcn/ui component references
- TypeScript language features

**Usage Pattern:**

```typescript
// Documentation access workflow
1. Resolve library ID for the specific package
2. Get relevant documentation sections
3. Apply current best practices and APIs
4. Verify implementation patterns
```

## Project Architecture

Next-Bruss is an industrial manufacturing web application with two distinct user interfaces:

### Application Structure

- **Production Floor Apps** (`/app/(pro)/[lang]/`) - Minimal terminal-optimized interfaces
  - `dmcheck/` - DMC scanning and quality tracking (legacy)
  - `dmcheck-2/` - Modern DMC system with box/pallet management
  - `inw-2/` - Inventory management
  - `oven/` - Oven monitoring and temperature tracking
  - `eol136153-2/` - End-of-line validation system

- **Management Interface** (`/app/(mgmt)/[lang]/`) - Full-featured administrative interface
  - `admin/` - User management, articles, employees
  - Quality management: `deviations/`, `failures/`, `capa-old/`
  - Production data: `dmcheck-data/`, `oven-data/`, `production-overtime/`
  - Tools: `codes-generator/`, `projects/`, `news/`

### Key Technical Patterns

**Database Access Pattern:**

```typescript
import { dbc } from '@/lib/mongo';

const collection = await dbc('collection_name');
// Always check for archive collections with _archive suffix
const archiveCollection = await dbc('collection_name_archive');
```

**Server Actions Pattern:**

```typescript
'use server';
import { auth } from '@/auth';
import { revalidateTag } from 'next/cache';

export async function actionName(data: Type) {
  const session = await auth();
  if (!session?.user?.roles?.includes('required-role')) {
    return { error: 'unauthorized' };
  }

  // Perform operation
  revalidateTag('tag-name');
  return { success: 'message' };
}
```

**Authentication & Authorization:**

- LDAP-based authentication via NextAuth.js
- Role-based access control stored in MongoDB `users` collection
- Session includes `user.roles` array for permission checking
- Roles are refreshed periodically (default: 1 hour)

**State Management:**

- **Zustand** for client-side state with persistence (`/lib/hooks/`)
- **React Query** for server state management
- **nuqs** for URL state synchronization
- Server Components by default, `'use client'` when needed

**Form Handling:**

- React Hook Form + Zod validation
- Error handling: return `{ error: string }` from server actions

## Technology Stack

- **Runtime**: Bun package manager
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom Bruss theme (`bruss: '#8bb63b'`)
- **UI Components**: shadcn/ui (Radix UI primitives) in `/components/ui/`
- **Databases**: MongoDB (primary) + PostgreSQL (legacy integrations)
- **Authentication**: NextAuth.js with LDAP provider
- **Internationalization**: Built-in i18n (Polish, German, English, and other languages for production applications)

## Debugging & Troubleshooting

### Using MCP Tools for Debugging

**Playwright MCP for UI Issues:**

```bash
# Debug workflow with Playwright MCP
1. Navigate to problematic page
2. Take screenshot to see current state
3. Take snapshot to analyze DOM structure
4. Interact with elements to reproduce issue
5. Verify expected vs actual behavior
```

**MongoDB MCP for Data Issues:**

```bash
# Data debugging workflow
1. Connect to database using MCP MongoDB
2. Inspect collection schemas to understand structure
3. Query specific documents with filters
4. Analyze data integrity with count operations
5. Use aggregation to identify patterns or issues
```

**Context7 for Documentation Issues:**

```bash
# When existing patterns don't work
1. Resolve library ID for the problematic package
2. Get current documentation for the specific feature
3. Compare with existing implementation
4. Update code to match current best practices
```
