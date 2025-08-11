import { Input, type InputProps } from '@/components/ui/input';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProInputProps extends InputProps {
  proSize?: 'sm' | 'default' | 'lg' | 'xl';
}

const ProInput = React.forwardRef<HTMLInputElement, ProInputProps>(
  ({ className, proSize = 'default', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-12 px-4 py-2.5 text-sm',
      default: 'h-14 px-5 py-3 text-base',
      lg: 'h-16 px-6 py-4 text-lg',
      xl: 'h-20 px-8 py-5 text-xl',
    };

    return (
      <Input
        ref={ref}
        className={cn(
          'touch-manipulation select-none transition-all duration-200',
          'focus-visible:ring-4 focus-visible:ring-offset-4',
          'border-2 rounded-lg',
          sizeClasses[proSize],
          className
        )}
        {...props}
      />
    );
  },
);
ProInput.displayName = 'ProInput';

const ProTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    proSize?: 'sm' | 'default' | 'lg' | 'xl';
  }
>(({ className, proSize = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'min-h-[100px] px-4 py-3 text-sm',
    default: 'min-h-[120px] px-5 py-4 text-base',
    lg: 'min-h-[140px] px-6 py-5 text-lg',
    xl: 'min-h-[160px] px-8 py-6 text-xl',
  };

  return (
    <textarea
      className={cn(
        'flex w-full rounded-lg border-2 bg-background ring-offset-background',
        'placeholder:text-muted-foreground',
        'focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:outline-hidden',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-all duration-200 touch-manipulation resize-none',
        sizeClasses[proSize],
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
ProTextarea.displayName = 'ProTextarea';

export { ProInput, ProTextarea };