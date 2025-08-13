# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next-Bruss is an industrial manufacturing web application built with Next.js 15, serving production floor operations and management tasks. The app has two main sections:

- **Production** (`/pro`) - DMC scanning, inventory, oven monitoring
- **Management** (`/mgmt`) - Admin, deviations, failures, quality control

## Essential Commands

```bash
# Development
bun dev          # Start development server with Turbopack (always run in background)
bun build        # Create production build (with Turbopack) - DO NOT run while bun dev is running
bun start        # Start production server
bun lint         # Run ESLint

# Database connections
# MongoDB: Connection string in MONGODB_URI env var
# PostgreSQL: Connection string in PG_STRING env var

# Note: No test framework configured - testing is handled manually
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

### Production Floor Applications (Pro)

Production applications are touchscreen-optimized interfaces for factory floor operations. **For detailed Production Floor Applications documentation, patterns, and implementation guidelines, see [PRO.md](PRO.md).**

### Management Applications (Mgmt)

Management applications are full-featured web interfaces for administrative tasks. **For detailed Management Applications documentation, patterns, and implementation guidelines, see [MGMT.md](MGMT.md).**

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

- **Global UI components**: `/components/ui/` (shadcn/ui based)
- **Page-specific components**: Co-located with routes
- **Server Components**: Default, mark Client Components with `'use client'`

#### State Management

- **URL state**: nuqs for search params synchronization

#### Internationalization

- **Locales**: `pl` (default), `de`, `en`, `uk`, `be`, `tl` (6 total)
- **Dictionary files**: `/app/dictionaries/{app-name}/{locale}.json`
- **Access pattern**: `getDictionary(lang)` for server components
- **Fallback**: Always provide Polish fallback for missing translations
- **URL structure**: `/[lang]/app-name` (e.g., `/pl/dmcheck-2`, `/en/admin`)

### Critical Implementation Notes

1. **Multi-select filters**: Use OR within field, AND between fields
2. **Date handling**: Always use ISO strings for consistency
3. **Error handling**: Return `{ error: string }` from server actions
4. **Form validation**: Zod schemas with React Hook Form
5. **Archive data**: Check both main and archive collections
6. **Dictionary fallbacks**: Always provide Polish fallbacks with `|| 'Polish text'`

### Code Style Guidelines

**Code Style and Structure**

- Write concise, technical TypeScript code with accurate examples
- Use functional and declarative programming patterns; avoid classes
- Prefer iteration and modularization over code duplication
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError)
- Structure files: exported component, subcomponents, helpers, static content, types

**Naming Conventions**

- Use lowercase with dashes for directories (e.g., components/auth-wizard)
- Favor named exports for components

**TypeScript Usage**

- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces

**Syntax and Formatting**

- Use the "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements
- Use declarative JSX

**UI and Styling**

- Use Shadcn UI and Tailwind for components and styling
- Implement responsive design with Tailwind CSS; use a mobile-first approach
- No border-radius (`--radius: 0rem`)
- Uses OKLCH color space for better color management and accessibility

**Performance Optimization**

- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC)
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images: use WebP format, include size data, implement lazy loading

**Key Conventions**

- Use 'nuqs' for URL search parameter state management
- Optimize Web Vitals (LCP, CLS, FID)
- Limit 'use client': Favor server components and Next.js SSR, use only for Web API access in small components, avoid for data fetching or state management

**Development Workflow**

- **CRITICAL**: Always start `bun dev` in background immediately after the first question is asked - this enables monitoring of the Next.js application and real-time error detection
- Monitor development server output for build errors, runtime issues, and performance warnings

### External Integrations

- **SMART API**: EOL validation endpoints
- **LDAP**: Enterprise authentication
- **PostgreSQL**: Legacy system data access

### Cron Jobs (next-bruss-cron workspace)

Separate Node.js app handles:

- Deviation reminders and status updates
- Production overtime notifications
- HR training evaluation tracking
- LDAP/R2platnik data synchronization
- IoT sensor logging (every minute)
- Weekly data archiving