# Next-Bruss

A modern web application built with Next.js 15, featuring a robust authentication system, internationalization support, and a comprehensive UI component library.

## 📱 Applications Overview

The project consists of two main applications designed for different user roles:

### 1. Production Application (`/pro`)

The production application is designed for daily operations on the production floor.

#### Core Modules

##### 1. Inventory Management (`/inw-2`)

- **Inventory Operations** (`/spis`)
  - Records and confirms the current status of products and items in production and warehouse areas
  - Features:
    - Real-time inventory tracking
    - Stock level monitoring
    - Material movement tracking
    - Barcode scanning support
    - Quick stock updates
    - Inventory alerts

##### 2. DMCheck System (`/dmcheck`)

- **Production Tracking and Traceability**
  - DMC (Data Matrix Code) scanning and validation for produced parts
  - Batch tracking and traceability system
  - Features:
    - DMC code validation with manufacturer-specific rules
    - Real-time data entry and validation
    - Box and pallet management
    - Quality control integration
    - Complete traceability chain (part → box → pallet → warehouse)
    - External system integration (SMART API, quality databases)
    - Real-time status monitoring
    - Batch tracking
    - Operator tracking and accountability
    - Historical data management
    - Export and reporting capabilities

##### 3. Oven Management (`.oven`)

- **Production Monitoring**
  - Features:
    - Temperature tracking
    - Process parameters
    - Quality control
    - Real-time monitoring
    - Alert system
    - Historical data tracking

### 2. Management Application (`/mgmt`)

The management application is designed for administrative staff.

#### Core Modules

##### 1. Inventory Management (`/inw-2`)

- **Approval System** (`/zatwierdz`)
  - Features:
    - Approval workflow
    - Approval history tracking
    - Document verification
    - Report generation

##### 2. Deviations Management (`/deviations`)

- **Deviation Tracking**
  - Features:
    - Create and manage deviations
    - Document handling
    - Approval workflows
    - Root cause analysis
    - Corrective actions
    - Email notifications
    - Analytics dashboard

##### 3. Codes Generator (`/codes-generator`)

- **Code Generation**
  - Features:
    - Custom code formats

##### 4. Production Overtime (`/production-overtime`)

- **Overtime Management**
  - Features:
    - Overtime tracking
    - Approval workflows
    - Resource allocation
    - Cost tracking
    - Analytics

##### 5. Projects Management (`/projects`)

- **Project Tracking**
  - Features:
    - Project lifecycle management
    - Resource allocation
    - Timeline tracking
    - Budget tracking
    - Team management

##### 6. Failures Management (`/failures`)

- **Failure Tracking**
  - Features:
    - Failure reporting
    - Root cause analysis
    - Corrective actions
    - Preventive measures
    - Trend analysis
    - Quality metrics

##### 7. DMCheck Data (`/dmcheck-data`)

- **Data Management**
  - Features:
    - Data validation
    - Data export/import
    - Analytics

##### 8. Administration (`/admin`)

- **System Administration**
  - Features:
    - User management
    - Role configuration
    - System settings
    - Access control
    - Audit logging
    - System monitoring

##### 9. Authentication (`/auth`)

- **Security Management**
  - Features:
    - User authentication
    - Session management
    - Access control
    - Security policies
    - Audit trails
    - Compliance monitoring

#### Legacy Modules

- **Pro Old** (`/pro-old`) - Legacy production features
- **Inw Old** (`/inw-old`) - Legacy inventory system
- **CAPA Old** (`/capa-old`) - Legacy CAPA system

## 🔧 Technical Implementation

### Core Technologies

- **Frontend**
  - Next.js 15 with App Router
  - TypeScript
  - Tailwind CSS
  - React Query
  - Zustand

### Architecture

- **State Management**

  - Zustand for client state
  - Context API for theme and auth

- **Data Flow**

  - Server actions for mutations
  - Real-time updates
  - Optimistic updates
  - Error handling

- **Security**

  - NextAuth.js integration
  - LDAP authentication
  - Role-based access control
  - Session management

- **Database**
  - MongoDB
  - Connection pooling
  - Transaction management

### UI/UX

- **Components**

  - shadcn/ui components (built on Radix UI primitives)
  - Theme support
  - Responsive design

- **Forms**
  - React Hook Form
  - Zod validation
  - Custom validators
  - Error handling

## 📦 Project Structure

```
├── app/                    # Next.js app directory
│   ├── (pro)/             # Production application
│   │   └── [lang]/        # Internationalized routes
│   │       ├── inw-2/     # Inventory management
│   │       ├── dmcheck/   # DMCheck system
│   │       └── .oven/     # Oven management
│   └── (mgmt)/            # Management application
│       └── [lang]/        # Internationalized routes
│           ├── inw-2/     # Inventory approval
│           ├── deviations/# Deviations management
│           └── ...        # Other management modules
├── components/            # Shared UI components
├── lib/                  # Shared utilities
├── public/              # Static assets
├── styles/             # Global styles
├── types/             # TypeScript definitions
└── utils/            # Helper functions
```

### Development

- Development server: `bun run dev`
- Production build: `bun run build`
- Start production: `bun run start`
- Linting: `bun run lint`
