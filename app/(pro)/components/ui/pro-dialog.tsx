'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

const ProDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  ProDialogContentProps
>(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'max-w-md',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw] h-[90vh]',
  };

  return (
    <DialogContent
      ref={ref}
      className={cn(
        'p-8 gap-6 rounded-xl border-2',
        '[&>button]:p-3 [&>button]:top-6 [&>button]:right-6',
        '[&>button]:rounded-lg [&>button]:touch-manipulation',
        '[&>button_svg]:h-6 [&>button_svg]:w-6',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
ProDialogContent.displayName = 'ProDialogContent';

const ProDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogHeader
    className={cn(
      'space-y-3',
      className,
    )}
    {...props}
  />
);
ProDialogHeader.displayName = 'ProDialogHeader';

const ProDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <DialogFooter
    className={cn(
      'gap-3 sm:gap-4',
      className,
    )}
    {...props}
  />
);
ProDialogFooter.displayName = 'ProDialogFooter';

const ProDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogTitle>,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, ...props }, ref) => (
  <DialogTitle
    ref={ref}
    className={cn(
      'text-xl font-semibold',
      className,
    )}
    {...props}
  />
));
ProDialogTitle.displayName = 'ProDialogTitle';

const ProDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogDescription>,
  React.ComponentPropsWithoutRef<typeof DialogDescription>
>(({ className, ...props }, ref) => (
  <DialogDescription
    ref={ref}
    className={cn('text-base', className)}
    {...props}
  />
));
ProDialogDescription.displayName = 'ProDialogDescription';

export {
  Dialog as ProDialog,
  DialogClose as ProDialogClose,
  ProDialogContent,
  ProDialogDescription,
  ProDialogFooter,
  ProDialogHeader,
  DialogOverlay as ProDialogOverlay,
  DialogPortal as ProDialogPortal,
  ProDialogTitle,
  DialogTrigger as ProDialogTrigger,
};