# Bruss-Intra

Industrial manufacturing management web application built with Next.js 16.

> **Note:** Shop floor applications (DMCheck-2, EOL136153-2, INW-2, Oven) have been moved to the **bruss-floor** project for dedicated production floor operations.

## 📱 Applications

### Management & Analytics

- **Deviations** (`/deviations`) - Quality deviation tracking and management
- **DMCheck Data** (`/dmcheck-data`) - Analytics and reporting for DMCheck operations
- **Failures** (`/failures`) - Failure analysis and tracking
- **News** (`/news`) - Company news and announcements
- **Oven Data** (`/oven-data`) - Oven process data visualization and analysis
- **Projects** (`/projects`) - Project management and tracking
- **Overtime Orders** (`/overtime-orders`) - Overtime order management
- **Overtime Submissions** (`/overtime-submissions`) - Employee overtime request submissions
- **Production Overtime** (`/production-overtime`) - Production overtime tracking and approval
- **Inventory Approval** (`/inventory`) - Inventory operation approvals and management
- **Codes Generator** (`/codes-generator`) - Production code and label generation

## 🔗 Related Projects

- **bruss-floor** - Dedicated shop floor applications (DMCheck-2, EOL136153-2, INW-2, Oven)
- **bruss-cron** - Scheduled tasks, monitoring, and automation services

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
