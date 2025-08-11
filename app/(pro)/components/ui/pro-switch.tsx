'use client';

import { Switch } from '@/components/ui/switch';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface ProSwitchProps
  extends React.ComponentPropsWithoutRef<typeof Switch> {
  proSize?: 'sm' | 'default' | 'lg' | 'xl';
  label?: string;
  description?: string;
}

const ProSwitch = React.forwardRef<
  React.ElementRef<typeof Switch>,
  ProSwitchProps
>(({ className, proSize = 'default', label, description, ...props }, ref) => {
  const id = React.useId();
  
  const sizeClasses = {
    sm: 'h-10 w-20 [&>span]:h-8 [&>span]:w-8 [&>span[data-state=checked]]:translate-x-10',
    default: 'h-12 w-24 [&>span]:h-10 [&>span]:w-10 [&>span[data-state=checked]]:translate-x-12',
    lg: 'h-14 w-28 [&>span]:h-12 [&>span]:w-12 [&>span[data-state=checked]]:translate-x-14',
    xl: 'h-16 w-32 [&>span]:h-14 [&>span]:w-14 [&>span[data-state=checked]]:translate-x-16',
  };
  
  const switchElement = (
    <Switch
      id={label || description ? id : undefined}
      ref={ref}
      className={cn(
        'touch-manipulation transition-all duration-200',
        'focus-visible:ring-4 focus-visible:ring-offset-4',
        'rounded-full',
        sizeClasses[proSize],
        className
      )}
      {...props}
    />
  );

  if (label || description) {
    return (
      <div className="flex items-center space-x-4">
        {switchElement}
        <div className="space-y-1">
          {label && (
            <label
              htmlFor={id}
              className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return switchElement;
});
ProSwitch.displayName = 'ProSwitch';

export { ProSwitch };