import { Button, type ButtonProps } from '@/components/ui/button';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProButtonProps extends ButtonProps {
  proSize?: 'sm' | 'default' | 'lg' | 'xl';
}

const ProButton = React.forwardRef<HTMLButtonElement, ProButtonProps>(
  ({ className, size, proSize = 'default', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-12 px-5 py-2.5 text-sm gap-3 [&_svg]:size-5',
      default: 'h-14 px-6 py-3 text-base gap-3 [&_svg]:size-6',
      lg: 'h-16 px-8 py-4 text-lg gap-4 [&_svg]:size-7',
      xl: 'h-20 px-10 py-5 text-xl gap-4 [&_svg]:size-8',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          'touch-manipulation select-none active:scale-[0.98] transition-all duration-200',
          'focus-visible:ring-4 focus-visible:ring-offset-4',
          'font-semibold rounded-lg',
          sizeClasses[proSize],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  },
);
ProButton.displayName = 'ProButton';

export { ProButton };