# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next-Bruss is an industrial manufacturing web application built with Next.js 15, serving production floor operations and management tasks. The app has two main sections:

- **Production** (`/pro`) - DMC scanning, inventory, oven monitoring
- **Management** (`/mgmt`) - Admin, deviations, failures, quality control

## Essential Commands

```bash
# Development
bun dev          # Start development server with Turbopack
bun build        # Create production build
bun start        # Start production server
bun lint         # Run ESLint

# Database connections
# MongoDB: Connection string in MONGODB_URI env var
# PostgreSQL: Connection string in PG_STRING env var
```

## High-Level Architecture

### Route Structure

```
app/
├── (pro)/[lang]/       # Production floor apps (minimal layout)
│   ├── dmcheck-2/      # DMC scanning and validation (new version)
│   ├── dmcheck/        # Legacy DMC system
│   ├── inw-2/spis/     # Inventory management
│   └── oven/           # Oven process monitoring
└── (mgmt)/[lang]/      # Management apps (full layout with nav)
    ├── admin/          # User administration
    ├── deviations/     # Quality deviation tracking
    └── failures/       # Failure analysis
```

### Key Patterns

#### Server Actions

Located in `actions.ts` files, follow this pattern:

```typescript
'use server';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';

export async function actionName(data: Type) {
  const session = await auth();
  if (!session?.user?.roles?.includes('required-role')) {
    return { error: 'unauthorized' };
  }

  const collection = await dbc('collection_name');
  // Perform operation
  revalidateTag('tag-name');
  return { success: 'message' };
}
```

#### Database Access

- **MongoDB**: Use `dbc()` from `/lib/mongo` - handles connection pooling
- **PostgreSQL**: Use `pgp` default export from `/lib/pg` - for legacy integrations
- Always check for archive collections (suffix `_archive`) as fallback

#### Authentication

- LDAP-based authentication via NextAuth.js v5
- Role checking: `session.user.roles.includes('role-name')`
- Roles stored in MongoDB `users` collection

#### Component Structure

- UI components in `/components/ui/` (shadcn/ui based)
- Page-specific components co-located with routes
- Use Server Components by default, mark Client Components with `'use client'`

#### State Management

- **Client state**: Zustand with persist middleware
- **URL state**: nuqs for search params synchronization
- **Server state**: React Query for caching and mutations

#### Internationalization

- Locales: `pl` (default), `de`, `en`, `uk`, `be`, `tl`
- Dictionary files in `/app/dictionaries/`
- Access via `getDictionary(lang)`

### Critical Implementation Notes

1. **Multi-select filters**: Use OR within field, AND between fields
2. **Date handling**: Always use ISO strings for consistency
3. **Error handling**: Return `{ error: string }` from server actions
4. **Cache invalidation**: Use `revalidateTag()` after mutations
5. **Form validation**: Zod schemas with React Hook Form
6. **Archive data**: Check both main and archive collections

### External Integrations

- **SMART API**: EOL validation endpoints
- **LDAP**: Enterprise authentication
- **PostgreSQL**: Legacy system data access
- **Arduino Controllers**: IoT sensor data

### Cron Jobs (next-bruss-cron workspace)

Separate Node.js app handles:

- Deviation reminders and status updates
- Production overtime notifications
- HR training evaluation tracking
- LDAP/R2platnik data synchronization
- IoT sensor logging (every minute)
- Weekly data archiving

### Development Workflow

1. Create route in appropriate section (`pro` or `mgmt`)
2. Add server actions in `actions.ts`
3. Implement UI with shadcn components
4. Add role-based access control
5. Test with both Polish and German locales
