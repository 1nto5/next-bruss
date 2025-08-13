# MGMT.md - Management Applications

This file provides guidance for developing Management Applications in the Next-Bruss codebase.

## Overview

Management Applications are full-featured web interfaces for administrative tasks, located in `app/(mgmt)/[lang]/` directories. These applications provide comprehensive dashboards, data management, and administrative functionality with full navigation layouts.

## Application Characteristics

- **Full UI**: Complete navigation with header, main content, footer
- **Role-based Access**: Comprehensive authorization system
- **Data Tables**: Advanced filtering, sorting, and pagination
- **Form Management**: Complex forms with validation
- **Email Notifications**: Automated workflow notifications
- **Multi-language**: Support for 6 locales with Polish as default

## Architecture Pattern

### Layout Structure

```typescript
// Root Layout: app/(mgmt)/[lang]/layout.tsx
export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { lang } = params;
  const { children } = props;
  const dictionary = await getDictionary(lang);

  return (
    <>
      <div className='flex min-h-screen flex-col space-y-1'>
        <Header dict={dictionary} lang={lang} />
        <main className='mx-auto w-full max-w-[96rem] flex-1'>
          <div className='w-full'>
            <NuqsProvider>{children}</NuqsProvider>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
```

### Page Structure

```typescript
// Example: app/(mgmt)/[lang]/admin/users/page.tsx
export default async function UsersPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  if (!session?.user?.roles?.includes('admin')) {
    redirect('/');
  }

  const params = await props.params;
  const searchParams = await props.searchParams;
  const { lang } = params;

  const { fetchTime, users } = await getUsers(lang, searchParams);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>Users Management</h1>
        <Button asChild>
          <Link href="/admin/users/add">
            <Plus className="h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={users} fetchTime={fetchTime} />
    </div>
  );
}
```

## Authentication & Authorization

### Role-Based Access Control

```typescript
// Check authentication and roles
export default async function ProtectedPage() {
  const session = await auth();
  if (!session) {
    redirect('/auth');
  }
  if (!session?.user?.roles?.includes('required-role')) {
    redirect('/');
  }
  // Page content...
}

// Common roles in the system:
// - admin: Full system access
// - group-leader: Team management
// - quality-manager: Quality control
// - production-manager: Production oversight
// - plant-manager: Plant-wide authority
// - hr: HR functions
```

### Authentication Actions

```typescript
// app/(mgmt)/[lang]/auth/actions.ts
export async function login(email: string, password: string) {
  try {
    await signIn('credentials', {
      email: email.toLowerCase(),
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'invalid credentials' };
        default:
          return { error: 'default error' };
      }
    }
    return { error: 'default error' };
  }
}

export async function logout() {
  await signOut();
}
```

## Data Fetching Pattern

Management applications use Next.js server-side data fetching with caching:

```typescript
// Server-side data fetching with cache
async function getUsers(
  lang: string,
  searchParams: { [key: string]: string | undefined }
): Promise<{ fetchTime: string; users: UserType[] }> {
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(
      ([_, value]) => value !== undefined
    ) as [string, string][]
  );

  const queryParams = new URLSearchParams(filteredSearchParams).toString();
  const res = await fetch(`${process.env.API}/users/?${queryParams}`, {
    next: { revalidate: 60 * 15, tags: ['users'] }, // 15 min cache
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(`getUsers error: ${res.status} ${res.statusText} ${json.error}`);
  }

  const dateFromResponse = new Date(res.headers.get('date') || '');
  const fetchTime = dateFromResponse.toLocaleString(lang);
  const users = await res.json();

  return { fetchTime, users };
}

// Alternative: No cache for real-time data
const res = await fetch(`${process.env.API}/realtime-data`, {
  cache: 'no-store',
});
```

## Server Actions Pattern

Server actions handle mutations and use `revalidateTag` for cache invalidation:

```typescript
'use server';

import { auth } from '@/auth';
import { dbc } from '@/lib/mongo';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveUser(userData: UserType) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session || !session?.user?.roles?.includes('admin')) {
      redirect('/auth');
    }

    // 2. Database operations
    const collection = await dbc('users');
    const result = await collection.insertOne({
      ...userData,
      createdBy: session.user.email,
      createdAt: new Date(),
    });

    if (result.insertedId) {
      // 3. Cache revalidation
      revalidateTag('users');

      // 4. Optional: Send notifications
      await sendNotification({
        to: 'admin@company.com',
        subject: 'New User Created',
        body: `User ${userData.name} was created by ${session.user.email}`,
      });

      return { success: 'User created successfully' };
    }

    return { error: 'Failed to create user' };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateUser(userId: string, userData: UserType) {
  try {
    const session = await auth();
    if (!session || !session?.user?.roles?.includes('admin')) {
      redirect('/auth');
    }

    const collection = await dbc('users');
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...userData,
          updatedBy: session.user.email,
          updatedAt: new Date(),
        }
      }
    );

    if (result.modifiedCount > 0) {
      revalidateTag('users');
      return { success: 'User updated successfully' };
    }

    return { error: 'User not found or no changes made' };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred' };
  }
}
```

## Data Table Pattern

Management applications use consistent table structures:

```typescript
// Table Columns: app/(mgmt)/[lang]/module/table/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<DataType>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const id = row.original.id?.toString();
      return id ? id : '-';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const statusVariants = {
        'active': 'statusApproved',
        'pending': 'statusPending',
        'inactive': 'statusRejected',
      } as const;

      return (
        <Badge variant={statusVariants[status] || 'outline'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/edit/${item.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/${item.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];
```

### Data Table Component

```typescript
// Table Component: app/(mgmt)/[lang]/module/table/data-table.tsx
'use client';

import { DataTable as BaseDataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  fetchTime: string;
}

export function DataTable<TData>({
  columns,
  data,
  fetchTime,
}: DataTableProps<TData>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Last updated: {fetchTime}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.length} items total
        </p>
      </div>
      <BaseDataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search items..."
        filterColumn="name"
      />
    </div>
  );
}
```

## Form Management

### Form Components with Zod Validation

```typescript
// Form Schema: app/(mgmt)/[lang]/module/lib/zod.ts
import { z } from 'zod';

export const AddUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  department: z.string().min(1, 'Department is required'),
});

export type AddUserType = z.infer<typeof AddUserSchema>;

// Form Component: app/(mgmt)/[lang]/module/add/components/add-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddUserSchema, AddUserType } from '../lib/zod';
import { saveUser } from '../actions';
import { toast } from 'sonner';

export function AddUserForm() {
  const form = useForm<AddUserType>({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roles: [],
      department: '',
    },
  });

  async function onSubmit(values: AddUserType) {
    try {
      const result = await saveUser(values);

      if (result.success) {
        toast.success(result.success);
        form.reset();
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Create User'}
        </Button>
      </form>
    </Form>
  );
}
```

## Email Notifications

Management applications include automated email notifications:

```typescript
// Notification Helper: app/(mgmt)/[lang]/module/actions.ts
import mailer from '@/lib/mailer';

async function sendNotification(
  recipientEmail: string,
  subject: string,
  templateData: any
) {
  try {
    await mailer({
      to: recipientEmail,
      subject,
      html: `
        <div>
          <h2>${subject}</h2>
          <p>A new item requires your attention.</p>
          <p><a href="${process.env.BASE_URL}/path/to/item">View Item</a></p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Email notification failed:', error);
    return { error: 'Notification failed' };
  }
}

// Usage in server actions
export async function createDeviation(data: DeviationType) {
  // ... save to database

  // Send notifications to relevant roles
  const groupLeaders = await getUsersByRole('group-leader');

  for (const leader of groupLeaders) {
    await sendNotification(
      leader.email,
      `New Deviation [${data.internalId}] - Approval Required`,
      data
    );
  }
}
```

## URL State Management

Management applications use nuqs for URL state synchronization:

```typescript
// Search params management
'use client';

import { parseAsString, useQueryState } from 'nuqs';

export function TableFilteringAndOptions() {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(''));
  const [department, setDepartment] = useQueryState('department', parseAsString.withDefault(''));

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

## Error Handling

Management applications include comprehensive error handling:

```typescript
// Error Page: app/(mgmt)/[lang]/module/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// Loading Page: app/(mgmt)/[lang]/module/loading.tsx
import { Loader2 } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

## Component Structure

### Standard Management Components

- **Header**: Full navigation with user menu, notifications
- **Footer**: Company information and links
- **DataTable**: Advanced table with filtering, sorting, pagination
- **Forms**: Complex forms with validation and error handling
- **Dialogs**: Modal dialogs for actions (delete confirmation, edit forms)
- **Cards**: Content organization for dashboards

### Component Patterns

```typescript
// Header Component: app/(mgmt)/[lang]/components/header.tsx
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function Header({ dict, lang }: HeaderProps) {
  const session = await auth();

  return (
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <nav className="flex items-center space-x-4">
          <Link href="/">Dashboard</Link>
          {session?.user?.roles?.includes('admin') && (
            <Link href="/admin">Admin</Link>
          )}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

## Internationalization

Management applications use the same i18n system as the main application:

```typescript
// Dictionary access in server components
import { getDictionary } from '@/lib/dictionary';

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div>
      <h1>{dict.title}</h1>
      <p>{dict.description}</p>
    </div>
  );
}
```

## Development Guidelines

1. **Authentication First**: Always check session and roles before rendering protected content
2. **Cache Strategy**: Use Next.js cache with appropriate revalidation times for data that doesn't change frequently
3. **Cache Invalidation**: Use `revalidateTag` after mutations to keep data fresh
4. **Error Handling**: Implement proper error boundaries and loading states
5. **Form Validation**: Use Zod schemas for both client and server-side validation
6. **Role-Based UI**: Conditionally render UI elements based on user roles
7. **Notifications**: Send email notifications for workflow changes
8. **URL State**: Use nuqs for search params and filtering state
9. **Table Patterns**: Follow consistent table structure with columns and data-table components
10. **TypeScript**: Use proper type definitions for all data structures

Each module follows the same architectural patterns but implements domain-specific business logic and workflows.
