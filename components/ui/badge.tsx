import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        // Status-specific variants with "status" prefix
        statusPending:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
        statusApproved:
          'border-transparent bg-[#92b34e] text-white dark:bg-green-700 dark:text-green-100',
        statusInProgress:
          'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 whitespace-nowrap',
        statusClosed:
          'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        statusRejected:
          'border-transparent bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
        statusToApprove:
          'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
        statusDraft:
          'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
        // New variant for 'open' status
        statusOpen:
          'border-transparent bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200',
        // New variant for 'overdue' status
        statusOverdue:
          'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
        // New variant for 'accounted' status
        statusAccounted:
          'border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200',
        // New variant for 'cancelled' status
        statusCancelled:
          'border-transparent bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        // New variant for 'forecast' status
        statusForecast:
          'border-transparent bg-sky-100 text-sky-800 dark:bg-sky-800 dark:text-sky-200',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
