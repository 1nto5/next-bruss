import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  clickable?: boolean;
}

const ProCard = React.forwardRef<
  React.ElementRef<typeof Card>,
  ProCardProps
>(({ className, clickable = false, ...props }, ref) => (
  <Card
    ref={ref}
    className={cn(
      'rounded-xl border-2 transition-all duration-200',
      clickable && 'cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.99] touch-manipulation',
      className,
    )}
    {...props}
  />
));
ProCard.displayName = 'ProCard';

const ProCardHeader = React.forwardRef<
  React.ElementRef<typeof CardHeader>,
  React.ComponentPropsWithoutRef<typeof CardHeader>
>(({ className, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn('p-8 space-y-3', className)}
    {...props}
  />
));
ProCardHeader.displayName = 'ProCardHeader';

const ProCardTitle = React.forwardRef<
  React.ElementRef<typeof CardTitle>,
  React.ComponentPropsWithoutRef<typeof CardTitle>
>(({ className, ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn('text-2xl', className)}
    {...props}
  />
));
ProCardTitle.displayName = 'ProCardTitle';

const ProCardDescription = React.forwardRef<
  React.ElementRef<typeof CardDescription>,
  React.ComponentPropsWithoutRef<typeof CardDescription>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn('text-base', className)}
    {...props}
  />
));
ProCardDescription.displayName = 'ProCardDescription';

const ProCardContent = React.forwardRef<
  React.ElementRef<typeof CardContent>,
  React.ComponentPropsWithoutRef<typeof CardContent>
>(({ className, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn('px-8 pb-8', className)}
    {...props}
  />
));
ProCardContent.displayName = 'ProCardContent';

const ProCardFooter = React.forwardRef<
  React.ElementRef<typeof CardFooter>,
  React.ComponentPropsWithoutRef<typeof CardFooter>
>(({ className, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn('px-8 pb-8 gap-4', className)}
    {...props}
  />
));
ProCardFooter.displayName = 'ProCardFooter';

export {
  ProCard,
  ProCardContent,
  ProCardDescription,
  ProCardFooter,
  ProCardHeader,
  ProCardTitle,
};