# Bruss-Intra

Industrial manufacturing web application built with Next.js 15 for production floor operations and management.

## 📱 Applications

### Shop Floor Applications

- **DMCheck-2** (`/dmcheck-2`) - Data Matrix Code scanning and validation for production tracking
- **EOL136153-2** (`/eol136153-2`) - End-of-line process management
- **INW-2** (`/inw-2`) - Inventory management and tracking
- **Oven** (`/oven`) - Oven temperature monitoring and process control

### Management Applications

- **Deviations** (`/deviations`) - Quality deviation tracking and management
- **DMCheck Data** (`/dmcheck-data`) - Analytics and reporting for DMCheck operations
- **Failures** (`/failures`) - Failure analysis and tracking
- **News** (`/news`) - Company news and announcements
- **Oven Data** (`/oven-data`) - Oven process data visualization and analysis
- **Projects** (`/projects`) - Project management and tracking
- **Overtime Orders** (`/overtime-orders`) - Overtime order management
- **Overtime Submissions** (`/overtime-submissions`) - Employee overtime request submissions
- **Production Overtime** (`/production-overtime`) - Production overtime tracking and approval
- **Inventory Approval** (`/inw-2/zatwierdz`) - Inventory operation approvals
- **Codes Generator** (`/codes-generator`) - Production code and label generation

## 🛠️ Tech Stack

- Next.js 16, TypeScript, Tailwind CSS v4
- MongoDB (primary), PostgreSQL (legacy)
- NextAuth.js with LDAP authentication
- shadcn/ui components
- React Hook Form + Zod validation
- Internationalization (Polish, German)

## 🚀 Getting Started

```bash
bun install
bun dev
```

Requires MongoDB, PostgreSQL, and LDAP server configured via environment variables.
