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

## Project Structure

Next-Bruss is an industrial manufacturing web application with two main interfaces:

```
/app
├── (pro)/[lang]/         # Production floor apps (terminal-optimized)
│   ├── dmcheck-2/        # DMC scanning system
│   ├── oven/            # Temperature monitoring
│   ├── inw-2/           # Inventory management
│   └── [feature]/
│       ├── layout.tsx    # Layout wrapper (providers, metadata, shared UI)
│       ├── page.tsx      # Route page component
│       ├── error.tsx     # Error boundary (catches thrown errors)
│       ├── actions.ts    # Server actions ('use server')
│       ├── components/   # Feature-specific components
│       └── lib/          # Types, utilities, hooks
│
├── (mgmt)/[lang]/        # Management interface (full-featured)
│   ├── admin/           # User management, articles
│   ├── overtime-orders/ # Production overtime
│   ├── dmcheck-data/    # Production data analysis
│   └── [feature]/
│       ├── layout.tsx    # Layout wrapper (providers, metadata, shared UI)
│       ├── page.tsx      # Route page component
│       ├── error.tsx     # Error boundary (catches thrown errors)
│       └── (same structure as above)
│
/components/ui/          # shadcn/ui components
/lib/                    # Shared utilities (mongo, auth, types)
/types/                  # Global TypeScript types
```

**Key Patterns:**
- **Feature Organization**: Each feature contains actions.ts, components/, lib/, page.tsx
- **Internationalization**: `[lang]` dynamic route for multi-language support
- **Server-First**: Server Components default, `'use client'` when needed
- **Colocated Logic**: Server actions, types, and utilities grouped by feature

## Design Patterns & Implementation Templates

### 1. Server Actions Pattern

```typescript
'use server';
import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function actionName(data: FormDataType) {
  // Always check authentication first
  const session = await auth();
  if (!session?.user?.roles?.includes('required-role')) {
    return { error: 'unauthorized' };
  }

  // Database operations using dbc() pattern
  const collection = await dbc('collection_name');
  
  try {
    // Perform operation
    await collection.insertOne(data);
    
    // Always revalidate relevant cache tags
    revalidateTag('tag-name');
    
    return { success: 'Operation completed' };
  } catch (error) {
    return { error: 'Operation failed' };
  }
}
```

### 2. Page Component Pattern

```typescript
// app/[feature]/page.tsx
import { auth } from '@/auth';
import { DataTable } from './components/data-table';
import { getFeatureData } from './lib/data-fetchers';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { lang } = await params;
  const session = await auth();
  
  // Fetch data server-side
  const data = await getFeatureData(await searchParams, session?.user?.email);
  
  return (
    <div className="space-y-4">
      <DataTable data={data} session={session} lang={lang} />
    </div>
  );
}
```

### 3. Form Component Pattern

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formSchema, FormSchemaType } from './lib/zod';
import { submitAction } from './actions';

export default function FeatureForm() {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: { /* defaults */ },
  });

  async function onSubmit(data: FormSchemaType) {
    const result = await submitAction(data);
    if (result?.error) {
      // Handle error
    } else {
      // Handle success
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### 4. Database Access Pattern

```typescript
import { dbc } from '@/lib/mongo';

// Always use dbc() utility function
const collection = await dbc('collection_name');

// Check for archive collections with _archive suffix
const archiveCollection = await dbc('collection_name_archive');

// Standard operations
const results = await collection.find({ filter }).toArray();
const count = await collection.countDocuments({ filter });
```

### 5. Layout Pattern

Layouts wrap pages and nested routes, providing persistent UI and context.

**Key Concepts:**
- Layouts persist across navigation (don't re-render)
- Each route segment can have its own layout.tsx
- Layouts nest automatically following the folder structure
- Root layout is mandatory, others optional

**Layout Hierarchy:**
- **Root Layout** (`/app/layout.tsx`) - Required, wraps entire app
- **Route Group Layouts** (`/(mgmt)/[lang]/layout.tsx`) - Section structure  
- **Feature Layouts** (`/[feature]/layout.tsx`) - Feature-specific providers

```typescript
// Root Layout - app/layout.tsx (REQUIRED)
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ThemeProvider } from '@/lib/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={i18n.defaultLocale} suppressHydrationWarning>
      <body className='min-h-screen font-sans antialiased'>
        <ThemeProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster position='bottom-center' />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Route Group Layout - app/(mgmt)/[lang]/layout.tsx
export default async function MgmtLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  
  return (
    <>
      <div className='flex min-h-screen flex-col space-y-1'>
        <Header lang={lang} />
        <main className='mx-auto w-full max-w-[96rem]'>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

// Feature Layout with metadata
export const metadata: Metadata = {
  title: 'Feature Name (BRUSS)',
};

export default async function FeatureLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
```

**Important Pattern Notes:**
- **Nuqs Integration**: Use `NuqsAdapter` from `nuqs/adapters/next/app` in root layout for URL state management
- **Provider Placement**: Root layout handles global providers (Theme, Nuqs, Toast)
- **Avoid**: Passing dictionaries from layouts to children via props

### 6. URL State Management (Nuqs)

Nuqs provides type-safe URL search parameter state management, using the URL as the source of truth.

**Why Use Nuqs in Manufacturing Apps:**
- **Bookmarkable Filters**: Workers can bookmark specific production views
- **Session Persistence**: Filters survive page refresh (critical for shift changes)
- **URL Sharing**: Share filtered views between team members
- **Server-Side Access**: Filters available during SSR for better performance

**Setup Pattern:**
```typescript
// Root layout setup (already shown above)
import { NuqsAdapter } from 'nuqs/adapters/next/app';

// In layout.tsx
<NuqsAdapter>{children}</NuqsAdapter>
```

**Client-Side Usage:**
```typescript
'use client';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export default function DataTableFilters() {
  const [department, setDepartment] = useQueryState('dept', parseAsString.withDefault(''));
  const [dateRange, setDateRange] = useQueryState('date', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('all'));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  
  return (
    <div className="flex gap-4">
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger>
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="quality">Quality</SelectItem>
        </SelectContent>
      </Select>
      
      <Input 
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        placeholder="Date range"
      />
      
      <Button onClick={() => setPage(page + 1)}>
        Next Page ({page})
      </Button>
    </div>
  );
}
```

**Server-Side Usage:**
```typescript
// In page.tsx - for data fetching with filters
import { loadSearchParams } from './search-params';
import type { SearchParams } from 'nuqs/server';

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page({ searchParams }: PageProps) {
  const { department, dateRange, status, page } = await loadSearchParams(searchParams);
  
  // Use filters for server-side data fetching
  const data = await getFilteredData({ department, dateRange, status, page });
  
  return (
    <div>
      <DataTableFilters />
      <DataTable data={data} />
    </div>
  );
}
```

### 7. Enhanced Error Handling Pattern

Next.js uses error.tsx files as React Error Boundaries to catch and handle errors gracefully.

**How Errors Are Triggered:**
- **Server Components**: `throw new Error()` triggers nearest error.tsx
- **Not Found**: `notFound()` triggers nearest not-found.tsx  
- **Redirect**: `redirect()` terminates rendering and navigates

**Error Boundary Behavior:**
- error.tsx MUST be a Client Component ('use client')
- Catches ALL errors in its route segment and nested children
- Does NOT catch errors in the same segment's layout.tsx
- Server Component errors show generic message (security)
- Client Component errors show original message

```typescript
// app/[feature]/error.tsx
'use client';

import ErrorComponent from '@/components/error-component';
import { revalidateFeature as revalidate } from './actions';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorComponent error={error} reset={reset} revalidate={revalidate} />;
}
```

**Triggering Errors in Server Components:**
```typescript
// In page.tsx or server action
async function getFeatureData() {
  const res = await fetch(`${process.env.API}/endpoint`);
  
  if (!res.ok) {
    // This will trigger the nearest error.tsx boundary
    throw new Error(
      `Failed to fetch: ${res.status} ${res.statusText}`
    );
  }
  
  return res.json();
}

// Using notFound()
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const data = await getData(params.id);
  
  if (!data) {
    notFound(); // Triggers not-found.tsx
  }
  
  return <div>{data}</div>;
}
```

**Error Flow:**
```
Server Component throws Error
           ↓
    Caught by nearest error.tsx
           ↓  
    error.tsx renders fallback UI
           ↓
    User clicks "Try again" (reset())
           ↓
    Component re-renders

Special Cases:
- notFound() → not-found.tsx
- redirect() → Navigation (no error UI)  
- Event handlers → Need try/catch
- Layouts → Errors bubble to parent segment
```

### 8. Internationalization Pattern

**Correct Pattern - Dictionary in Pages:**
```typescript
// ✅ Correct: Dictionary fetched in page component
import { getDictionary } from '@/lib/dictionary';

export default async function Page({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  
  return (
    <div>
      <h1>{dict.welcome}</h1>
      <p>{dict.description}</p>
    </div>
  );
}
```

**Why This Pattern:**
- **Performance**: Only loads translations needed per page
- **Next.js Optimized**: Follows App Router i18n best practices  
- **Cache Efficient**: Each page component gets its own dictionary cache
- **Type Safety**: Direct access to typed dictionary objects

**Avoid Dictionary in Layouts:**
```typescript
// ❌ Avoid: Dictionary in layout component
// This pattern is not recommended per Next.js App Router i18n docs
export default async function Layout({ children, params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang); // Don't do this
  
  return (
    <Header dict={dict} lang={lang}> {/* Prop drilling */}
      {children}
    </Header>
  );
}
```

## Technology Stack

- **Runtime**: Bun package manager
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **Database**: MongoDB (primary) via `dbc()` utility
- **Authentication**: NextAuth.js with LDAP provider
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (client) + React Query (server) + nuqs (URL)
- **Styling**: Tailwind CSS v4 with custom Bruss theme (`bruss: '#8bb63b'`)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Tables**: TanStack Table for data tables
- **Internationalization**: Built-in i18n (Polish, German, English, etc.)

## MCP Server Tools

### UI Development - shadcn MCP

**Essential Functions:**
- `mcp__shadcn__search_items_in_registries` - Find components by name/description
- `mcp__shadcn__get_item_examples_from_registries` - Get complete usage examples
- `mcp__shadcn__view_items_in_registries` - View component source and details
- `mcp__shadcn__get_add_command_for_items` - Get installation commands

**Workflow:**
```bash
1. Search: search_items_in_registries(["@shadcn"], "button")
2. Examples: get_item_examples_from_registries(["@shadcn"], "button-demo")  
3. Install: get_add_command_for_items(["@shadcn/button"])
```

### Testing - Playwright MCP

**Key Functions:**
- `mcp__playwright__browser_navigate` - Go to URLs
- `mcp__playwright__browser_snapshot` - Analyze page structure  
- `mcp__playwright__browser_click/type` - Interact with elements
- `mcp__playwright__browser_take_screenshot` - Debug visually

**Quick Test Pattern:**
```bash
1. Start server: bun dev
2. Navigate: browser_navigate("http://localhost:3000")
3. Test: snapshot → click → verify
```

### Database - MongoDB MCP

**Functions:**
- `mcp__mongodb__connect` - Connect to database
- `mcp__mongodb__find` - Query collections
- `mcp__mongodb__collection-schema` - Inspect structure
- `mcp__mongodb__aggregate` - Complex queries

**Use Cases:**
- **Debugging**: Data inspection and analysis
- **Development**: Testing complex aggregations
- **Note**: Use `dbc()` pattern for application code

### Documentation - Context7 MCP

**Functions:**  
- `mcp__context7__resolve-library-id` - Find library IDs
- `mcp__context7__get-library-docs` - Get current docs

**Common Libraries:** Next.js (`/vercel/next.js`), React, MongoDB

## Authentication & Authorization

- **LDAP Authentication**: NextAuth.js with LDAP provider
- **Role-Based Access**: Stored in MongoDB `users` collection
- **Session Pattern**: `session?.user?.roles?.includes('role-name')`
- **Server Action Auth**: Always check session in server actions
- **Periodic Refresh**: User roles refreshed every hour

## File Naming Conventions

- **Pages**: `page.tsx` (route pages)
- **Server Actions**: `actions.ts` ('use server' functions)
- **Components**: `component-name.tsx` (kebab-case)
- **Types**: `types.ts` or `zod.ts` (validation schemas)
- **Utilities**: `utils.ts` or specific name
- **Error Handling**: `error.tsx` (Next.js error boundaries)