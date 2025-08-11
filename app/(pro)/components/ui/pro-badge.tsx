import { Badge, type BadgeProps } from '@/components/ui/badge';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProBadgeProps extends BadgeProps {
  proSize?: 'sm' | 'default' | 'lg';
}

const ProBadge = React.forwardRef<HTMLDivElement, ProBadgeProps>(
  ({ className, proSize = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      default: 'px-4 py-2 text-base',
      lg: 'px-5 py-2.5 text-lg',
    };

    return (
      <Badge
        ref={ref}
        className={cn(
          'touch-manipulation select-none',
          sizeClasses[proSize],
          className
        )}
        {...props}
      />
    );
  },
);
ProBadge.displayName = 'ProBadge';

export { ProBadge };