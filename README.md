# Next-Bruss

Next-Bruss is an industrial manufacturing web application built with Next.js 15, designed to streamline production floor operations and management tasks in manufacturing environments.

## 🚀 Overview

The application serves two primary user groups:
- **Production Floor Workers** - Real-time tracking, scanning, and monitoring tools
- **Management & Administration** - Quality control, analytics, and administrative functions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: NextAuth.js with LDAP integration
- **Databases**: 
  - MongoDB (primary)
  - PostgreSQL (legacy integrations)
- **State Management**:
  - Zustand (client state with persistence)
  - React Query/TanStack Query (server state)
  - nuqs (URL state synchronization)
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: Built-in i18n (Polish, German)
- **Package Manager**: Bun

## 📱 Applications

### Production Floor (`/pro`)

Minimal layout optimized for production floor terminals:

#### 1. DMCheck System (`/dmcheck`)
- DMC (Data Matrix Code) scanning and validation
- Real-time quality tracking
- Box and pallet management
- Complete traceability chain (part → box → pallet)
- Integration with SMART API for EOL validation
- Operator accountability tracking

#### 2. Inventory Management (`/inw-2/spis`)
- Real-time inventory tracking
- Barcode scanning support
- Stock level monitoring
- Material movement tracking

#### 3. Oven Monitoring (`/oven`)
- Temperature tracking and monitoring
- Process parameter management
- Real-time alerts
- Historical data analysis

### Management Application (`/mgmt`)

Full-featured layout with navigation:

#### 1. Administration (`/admin`)
- User management and roles
- Article configuration
- Employee management
- System settings

#### 2. Quality Management
- **Deviations** (`/deviations`) - Track and manage quality deviations
- **Failures** (`/failures`) - Failure analysis and corrective actions
- **CAPA** (`/capa-old`) - Corrective and Preventive Actions

#### 3. Production Management
- **DMCheck Data** (`/dmcheck-data`) - Analytics and data management
- **Oven Data** (`/oven-data`) - Temperature charts and process data
- **Projects** (`/projects`) - Project tracking and resource allocation

#### 4. HR Functions
- **Production Overtime** (`/production-overtime`) - Overtime tracking and approval
- **Overtime Submissions** (`/overtime-submissions`) - Employee overtime requests

#### 5. Tools
- **Codes Generator** (`/codes-generator`) - Generate production codes and labels
- **Inventory Approval** (`/inw-2/zatwierdz`) - Approve inventory operations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager
- MongoDB instance
- PostgreSQL instance (for legacy features)
- LDAP server (for authentication)

### Environment Variables

Create a `.env.local` file:

```bash
# Database
MONGODB_URI=mongodb://...
PG_STRING=postgresql://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# LDAP Configuration
LDAP_URL=ldap://...
LDAP_BIND_DN=...
LDAP_BIND_PASSWORD=...

# External APIs
SMART_API_URL=...
```

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun build

# Start production server
bun start
```

## 📁 Project Structure

```
next-bruss/
├── app/                    # Next.js App Router
│   ├── (pro)/             # Production floor apps
│   │   └── [lang]/        # Internationalized routes
│   ├── (mgmt)/            # Management apps
│   │   └── [lang]/        # Internationalized routes
│   └── api/               # API routes
├── components/            # Shared components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and helpers
│   ├── mongo/           # MongoDB connection
│   └── pg/              # PostgreSQL connection
├── dictionaries/        # i18n translations
├── public/             # Static assets
└── types/              # TypeScript definitions
```

## 🔐 Authentication & Authorization

- LDAP-based authentication via NextAuth.js
- Role-based access control (RBAC)
- Roles stored in MongoDB `users` collection
- Session management with JWT

## 🌍 Internationalization

- Supported languages: Polish (default), German
- Dictionary-based translations
- URL-based locale switching (`/pl/...`, `/de/...`)

## 🧪 Development Guidelines

### Server Actions Pattern

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

### Key Conventions

1. **Components**: Server Components by default, use `'use client'` when needed
2. **Database**: Always check archive collections (`_archive` suffix)
3. **Forms**: Zod schemas with React Hook Form
4. **State**: Zustand for client, React Query for server state
5. **Errors**: Return `{ error: string }` from server actions
6. **Cache**: Use `revalidateTag()` after mutations

## 📊 External Integrations

- **SMART API**: EOL validation for production parts
- **LDAP**: Enterprise authentication
- **Email**: Nodemailer for notifications
- **Barcode/QR**: bwip-js for code generation

## 🔧 Scripts

```bash
bun dev        # Development with Turbopack
bun build      # Production build
bun start      # Start production server
bun lint       # Run ESLint
```

## 📝 License

This is a private, proprietary application.

## 🤝 Contributing

Please refer to internal development guidelines and ensure all changes are tested with both Polish and German locales.